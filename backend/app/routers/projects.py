from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import Project, AuditLog
from app.schemas.career import ProjectResponse, ProjectCreate

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Project).order_by(Project.featured.desc(), Project.created_at.desc()))
    return res.scalars().all()

@router.post("", response_model=ProjectResponse)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    proj = Project(**data.dict())
    db.add(proj)

    # Audit
    audit = AuditLog(
        actor_type="user",
        action="CREATE_PROJECT",
        entity_type="project",
        entity_id=proj.id,
        metadata_json={"name": proj.name, "slug": proj.slug}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(proj)
    return proj

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Project).where(Project.id == project_id))
    proj = res.scalars().first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    for k, v in data.items():
        if hasattr(proj, k):
            setattr(proj, k, v)

    await db.commit()
    await db.refresh(proj)
    return proj

@router.delete("/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Project).where(Project.id == project_id))
    proj = res.scalars().first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.delete(proj)
    await db.commit()
    return {"status": "deleted", "project_id": project_id}
