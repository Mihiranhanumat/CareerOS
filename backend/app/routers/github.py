from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.db.models import GithubAccount, GithubRepository, GithubEvidence
from app.schemas.github import GithubAccountResponse, GithubRepositoryResponse, EvidenceApprovalRequest
from app.services.github_service import github_service

router = APIRouter(prefix="/github", tags=["GitHub Intelligence"])

@router.get("/accounts", response_model=List[GithubAccountResponse])
async def list_github_accounts(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(GithubAccount).options(
            selectinload(GithubAccount.repositories).selectinload(GithubRepository.evidence)
        )
    )
    return res.scalars().all()

@router.post("/connect", response_model=GithubAccountResponse)
async def connect_github_account(username: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)):
    acc = await github_service.connect_account(db, username=username)
    await github_service.sync_repositories(db, acc.id)
    res = await db.execute(
        select(GithubAccount).where(GithubAccount.id == acc.id).options(
            selectinload(GithubAccount.repositories).selectinload(GithubRepository.evidence)
        )
    )
    return res.scalars().first()

@router.post("/sync", response_model=List[GithubRepositoryResponse])
async def sync_github_repositories(account_id: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)):
    repos = await github_service.sync_repositories(db, account_id)
    res = await db.execute(
        select(GithubRepository).where(GithubRepository.github_account_id == account_id).options(
            selectinload(GithubRepository.evidence)
        )
    )
    return res.scalars().all()

@router.get("/repositories", response_model=List[GithubRepositoryResponse])
async def get_repositories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(GithubRepository).options(selectinload(GithubRepository.evidence))
    )
    return res.scalars().all()

@router.post("/evidence/{evidence_id}/approve")
async def approve_github_evidence(
    evidence_id: str,
    data: EvidenceApprovalRequest,
    db: AsyncSession = Depends(get_db)
):
    return await github_service.approve_evidence(db, evidence_id, data.add_as_verified_skill)

@router.post("/repositories/{repo_id}/import-project")
async def import_repo_as_project(repo_id: str, db: AsyncSession = Depends(get_db)):
    return await github_service.import_repo_as_project(db, repo_id)
