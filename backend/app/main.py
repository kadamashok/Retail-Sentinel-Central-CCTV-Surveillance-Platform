from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db import Base, SessionLocal, engine
from app.models import Role, User
from app.routers import admin, auth, viewer
from app.services.csv_templates import build_store_onboarding_template_csv

app = FastAPI(title=settings.project_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_user = db.scalar(select(User).where(User.email == settings.bootstrap_admin_email))
        if not admin_user:
            db.add(
                User(
                    email=settings.bootstrap_admin_email,
                    full_name=settings.bootstrap_admin_full_name,
                    password_hash=get_password_hash(settings.bootstrap_admin_password),
                    role=Role.admin,
                )
            )
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/download-sample-store-template")
def download_sample_store_template() -> Response:
    csv_content = build_store_onboarding_template_csv()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="sample_store_onboarding_template.csv"'
        },
    )


app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(admin.router, prefix=settings.api_v1_prefix)
app.include_router(viewer.router, prefix=settings.api_v1_prefix)
