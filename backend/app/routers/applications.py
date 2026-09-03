from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.db.models import Application, ApplicationEvent, ApplicationAnswer
from app.schemas.applications import (
    ApplicationResponse, ApplicationEventItem, ApplicationAnswerItem,
    OneClickApprovalRequest, ApplicationUpdateRequest
)
from app.services.application_service import application_service
from app.services.browser_automation import browser_automation

router = APIRouter(prefix="/applications", tags=["Application State Machine & Browser Workflow"])

@router.get("", response_model=List[ApplicationResponse])
async def list_applications(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Application).options(
            selectinload(Application.events),
            selectinload(Application.answers)
        ).order_by(Application.created_at.desc())
    )
    return res.scalars().all()

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Application).where(Application.id == application_id).options(
            selectinload(Application.events),
            selectinload(Application.answers)
        )
    )
    app = res.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.post("/approve", response_model=ApplicationResponse)
async def approve_application_one_click(
    request: OneClickApprovalRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    1-Click Approval: locks opportunity, synthesizes tailored ATS resume,
    generates verified answers, and initializes workflow state.
    """
    app = await application_service.approve_and_prepare(
        db=db,
        job_id=request.job_id,
        custom_resume_family=request.custom_resume_family
    )
    res = await db.execute(
        select(Application).where(Application.id == app.id).options(
            selectinload(Application.events),
            selectinload(Application.answers)
        )
    )
    return res.scalars().first()

@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    data: ApplicationUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Application).where(Application.id == application_id))
    app = res.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if data.status and data.status != app.status:
        app = await application_service.update_status(db, application_id, data.status, source="user")

    if data.notes is not None:
        app.notes = data.notes
    if data.next_action is not None:
        app.next_action = data.next_action
    if data.next_action_at is not None:
        app.next_action_at = data.next_action_at

    await db.commit()
    await db.refresh(app)
    
    ref = await db.execute(
        select(Application).where(Application.id == application_id).options(
            selectinload(Application.events),
            selectinload(Application.answers)
        )
    )
    return ref.scalars().first()

@router.post("/{application_id}/start")
async def start_browser_workflow(application_id: str, db: AsyncSession = Depends(get_db)):
    """
    Launch browser agent for permitted form autofill and resume submission.
    """
    res = await db.execute(
        select(Application).where(Application.id == application_id).options(
            selectinload(Application.answers)
        )
    )
    app = res.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    candidate_data = {a.field_name: a.answer for a in app.answers}
    session = await browser_automation.start_application_workflow(
        application_id=app.id,
        target_url=app.application_url or "http://localhost:8000/mock-portal/apply",
        candidate_data=candidate_data
    )

    if session.get("status") == "PAUSED_AT_CHECKPOINT":
        await application_service.update_status(db, app.id, "WAITING_FOR_USER", source="BrowserAgent")
    elif session.get("status") == "APPLICATION_READY":
        await application_service.update_status(db, app.id, "APPLICATION_READY", source="BrowserAgent")

    return session

@router.post("/{application_id}/checkpoint-resolve")
async def resolve_checkpoint(
    application_id: str,
    decision: str = Body(..., embed=True),  # "approve" / "edit" / "cancel"
    custom_input: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db)
):
    session = await browser_automation.resolve_checkpoint_and_continue(
        application_id=application_id,
        user_decision=decision,
        custom_input=custom_input
    )

    if session.get("status") == "SUBMITTED":
        await application_service.update_status(
            db=db,
            application_id=application_id,
            new_status="SUBMITTED",
            source="BrowserAgent",
            details=session.get("submission_confirmation")
        )

    return session

@router.get("/{application_id}/timeline", response_model=List[ApplicationEventItem])
async def get_application_timeline(application_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(ApplicationEvent).where(ApplicationEvent.application_id == application_id).order_by(ApplicationEvent.timestamp.asc())
    )
    return res.scalars().all()
