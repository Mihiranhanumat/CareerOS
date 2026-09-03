"""
CareerOS Multi-Agent Architecture
Narrow contracts, structured inputs/outputs, explicit permissions, logs and retry behavior.
"""

from typing import Dict, Any, List
from datetime import datetime

class AgentPermission:
    READ_PUBLIC_CAREER = "READ_PUBLIC_CAREER"
    READ_PRIVATE_CAREER = "READ_PRIVATE_CAREER"
    WRITE_CAREER_PROPOSAL = "WRITE_CAREER_PROPOSAL"
    APPROVE_CAREER = "APPROVE_CAREER"
    GENERATE_RESUME = "GENERATE_RESUME"
    WRITE_RESUME_VERSION = "WRITE_RESUME_VERSION"
    READ_JOBS = "READ_JOBS"
    CREATE_APPLICATION_DRAFT = "CREATE_APPLICATION_DRAFT"
    PREPARE_APPLICATION = "PREPARE_APPLICATION"
    BROWSER_READ = "BROWSER_READ"
    BROWSER_WRITE = "BROWSER_WRITE"
    SUBMIT_APPLICATION = "SUBMIT_APPLICATION"
    PUBLISH_PUBLIC_PROFILE = "PUBLISH_PUBLIC_PROFILE"

class BaseAgent:
    name: str
    description: str
    allowed_permissions: List[str]

    def __init__(self, name: str, description: str, permissions: List[str]):
        self.name = name
        self.description = description
        self.allowed_permissions = permissions

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "permissions": self.allowed_permissions
        }

# Defined System Agents
CAREER_MANAGER_AGENT = BaseAgent(
    name="CareerManagerAgent",
    description="Maintains verified profile, detects outdated/missing evidence, and converts natural-language updates into structured proposals.",
    permissions=[AgentPermission.READ_PRIVATE_CAREER, AgentPermission.WRITE_CAREER_PROPOSAL, AgentPermission.APPROVE_CAREER]
)

GITHUB_ANALYST_AGENT = BaseAgent(
    name="GithubAnalystAgent",
    description="Inspects authorized GitHub repositories, extracts dependency structures, and proposes contextual evidence.",
    permissions=[AgentPermission.READ_PUBLIC_CAREER, AgentPermission.WRITE_CAREER_PROPOSAL]
)

JOB_HUNTER_AGENT = BaseAgent(
    name="JobHunterAgent",
    description="Discovers and normalizes job opportunities from permitted sources.",
    permissions=[AgentPermission.READ_JOBS]
)

JOB_ANALYST_AGENT = BaseAgent(
    name="JobAnalystAgent",
    description="Extracts responsibilities, mandatory skills, preferred skills, eligibility, and keywords from JDs.",
    permissions=[AgentPermission.READ_JOBS]
)

MATCH_AGENT = BaseAgent(
    name="MatchAgent",
    description="Scores opportunities against verified evidence (0-100) and produces explainable gap breakdowns.",
    permissions=[AgentPermission.READ_PRIVATE_CAREER, AgentPermission.READ_JOBS]
)

RESUME_ENGINEER_AGENT = BaseAgent(
    name="ResumeEngineerAgent",
    description="Selects the best resume family, generates tailored ATS-friendly bullets, and validates factuality against verified facts.",
    permissions=[AgentPermission.READ_PRIVATE_CAREER, AgentPermission.GENERATE_RESUME, AgentPermission.WRITE_RESUME_VERSION]
)

APPLICATION_WRITER_AGENT = BaseAgent(
    name="ApplicationWriterAgent",
    description="Generates truthful application answers and cover letters strictly from verified facts.",
    permissions=[AgentPermission.READ_PRIVATE_CAREER, AgentPermission.CREATE_APPLICATION_DRAFT]
)

BROWSER_AGENT = BaseAgent(
    name="BrowserAgent",
    description="Performs permitted form navigation, uploads resumes, and pauses on human checkpoints.",
    permissions=[AgentPermission.BROWSER_READ, AgentPermission.BROWSER_WRITE, AgentPermission.SUBMIT_APPLICATION]
)

TRACKER_AGENT = BaseAgent(
    name="TrackerAgent",
    description="Tracks full application lifecycles and state transitions without silent inference.",
    permissions=[AgentPermission.READ_JOBS, AgentPermission.PREPARE_APPLICATION]
)

FOLLOWUP_AGENT = BaseAgent(
    name="FollowupAgent",
    description="Manages upcoming deadlines, interview dates, and preparation packs.",
    permissions=[AgentPermission.READ_JOBS]
)

CAREER_ADVISOR_AGENT = BaseAgent(
    name="CareerAdvisorAgent",
    description="Analyzes funnel conversion, identifies recurring skill gaps, and recommends strategic learning projects.",
    permissions=[AgentPermission.READ_PRIVATE_CAREER, AgentPermission.READ_JOBS]
)

SYSTEM_AGENTS = [
    CAREER_MANAGER_AGENT, GITHUB_ANALYST_AGENT, JOB_HUNTER_AGENT, JOB_ANALYST_AGENT,
    MATCH_AGENT, RESUME_ENGINEER_AGENT, APPLICATION_WRITER_AGENT, BROWSER_AGENT,
    TRACKER_AGENT, FOLLOWUP_AGENT, CAREER_ADVISOR_AGENT
]
