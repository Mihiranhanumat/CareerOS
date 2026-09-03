import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import (
    Profile, Skill, SkillEvidence, Project, ProjectSkill, Experience,
    Education, Certification, Achievement, CareerProposal, AuditLog
)
from app.schemas.career import ProposalDiffResponse, ProposalDiffItem
from app.services.ai_provider import ai_provider

class CareerManagerService:
    """
    Maintains verified career facts, detects duplicates, parses natural language career updates,
    generates structured diffs (Added / Changed / Suggested / Needs clarification), and enforces approval gate.
    """

    async def parse_update_and_propose(self, db: AsyncSession, raw_text: str) -> ProposalDiffResponse:
        # Prompt for structured diff
        schema_desc = """
        {
          "added": [{"type": "skill|project|experience|achievement|certification", "action": "added", "title": "...", "details": {}, "evidence_required": true, "evidence_text": "...", "confidence": 0.95}],
          "changed": [{"type": "...", "action": "changed", "title": "...", "details": {}, "evidence_required": false, "confidence": 0.9}],
          "suggested": [{"type": "...", "action": "suggested", "title": "...", "details": {}, "evidence_required": false, "confidence": 0.85}],
          "needs_clarification": [{"type": "...", "action": "needs_clarification", "title": "...", "details": {}, "evidence_required": true, "confidence": 0.5}]
        }
        """
        
        prompt = f"""Analyze this career update and extract proposed structured additions, modifications, suggestions, and items needing clarification:
        "{raw_text}"
        
        Rules:
        1. Never convert an unverified mention into a high-confidence verified claim without evidence.
        2. Identify exact skill names, technologies, or project updates.
        3. Flag ambiguous claims under needs_clarification.
        """

        parsed_json = await ai_provider.generate_structured(prompt, schema_desc)
        
        # Save Proposal Record
        proposal = CareerProposal(
            source="natural_language",
            raw_input=raw_text,
            parsed_diff=parsed_json,
            status="pending"
        )
        db.add(proposal)
        await db.commit()
        await db.refresh(proposal)

        return ProposalDiffResponse(
            proposal_id=proposal.id,
            raw_input=raw_text,
            added=[ProposalDiffItem(**item) for item in parsed_json.get("added", [])],
            changed=[ProposalDiffItem(**item) for item in parsed_json.get("changed", [])],
            suggested=[ProposalDiffItem(**item) for item in parsed_json.get("suggested", [])],
            needs_clarification=[ProposalDiffItem(**item) for item in parsed_json.get("needs_clarification", [])],
            status="pending"
        )

    async def approve_proposal(self, db: AsyncSession, proposal_id: str) -> Dict[str, Any]:
        """
        Commit proposed changes to verified career tables after user approval.
        """
        res = await db.execute(select(CareerProposal).where(CareerProposal.id == proposal_id))
        proposal = res.scalars().first()
        if not proposal:
            raise ValueError("Proposal not found")

        diff = proposal.parsed_diff
        applied_count = 0

        # Apply Added Items
        for item in diff.get("added", []):
            item_type = item.get("type")
            details = item.get("details", {})
            title = item.get("title", "")

            if item_type == "skill":
                name = details.get("name", title.replace(" Proficiency", "").strip())
                norm = name.lower().replace(" ", "_")
                
                # Check if skill exists
                s_res = await db.execute(select(Skill).where(Skill.normalized_name == norm))
                existing_skill = s_res.scalars().first()
                if not existing_skill:
                    new_skill = Skill(
                        name=name,
                        category=details.get("category", "backend"),
                        normalized_name=norm,
                        proficiency=details.get("proficiency", "Advanced"),
                        verified=True,
                        confidence=item.get("confidence", 0.95)
                    )
                    db.add(new_skill)
                    await db.flush()

                    # Add supporting evidence
                    ev = SkillEvidence(
                        skill_id=new_skill.id,
                        source_type="natural_language_update",
                        source_id=proposal.id,
                        evidence_text=item.get("evidence_text") or f"Approved update: {proposal.raw_input}",
                        verification_state="verified",
                        confidence=item.get("confidence", 0.95)
                    )
                    db.add(ev)
                    applied_count += 1
                else:
                    existing_skill.verified = True
                    applied_count += 1

            elif item_type == "project":
                slug = details.get("name", title).lower().replace(" ", "-")
                p_res = await db.execute(select(Project).where(Project.slug == slug))
                if not p_res.scalars().first():
                    new_proj = Project(
                        name=details.get("name", title),
                        slug=slug,
                        short_description=details.get("short_description", "Updated via CareerOS AI assistant"),
                        problem=details.get("problem", "Identified engineering challenge"),
                        solution=details.get("solution", details.get("solution", proposal.raw_input)),
                        technologies=details.get("technologies", []),
                        verified=True
                    )
                    db.add(new_proj)
                    applied_count += 1

        proposal.status = "approved"
        proposal.reviewed_at = datetime.utcnow()

        # Audit Log
        audit = AuditLog(
            actor_type="user",
            action="APPROVE_CAREER_PROPOSAL",
            entity_type="career_proposal",
            entity_id=proposal_id,
            metadata_json={"applied_items": applied_count, "raw_input": proposal.raw_input}
        )
        db.add(audit)
        await db.commit()

        return {"status": "approved", "applied_items": applied_count, "proposal_id": proposal_id}

    async def reject_proposal(self, db: AsyncSession, proposal_id: str) -> Dict[str, Any]:
        res = await db.execute(select(CareerProposal).where(CareerProposal.id == proposal_id))
        proposal = res.scalars().first()
        if not proposal:
            raise ValueError("Proposal not found")
        proposal.status = "rejected"
        proposal.reviewed_at = datetime.utcnow()
        await db.commit()
        return {"status": "rejected", "proposal_id": proposal_id}

career_manager_service = CareerManagerService()
