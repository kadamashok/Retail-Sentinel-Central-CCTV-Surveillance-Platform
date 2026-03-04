import csv
import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import delete, or_, select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.deps import require_admin
from app.db import get_db
from app.models import CameraChannel, DeviceStatus, DVRDevice, Store, User
from app.schemas import (
    BulkOnboardResult,
    DVRConnectivityResult,
    DVRCreate,
    DVROut,
    DVRUpdate,
    PasswordResetRequest,
    StoreCreate,
    StoreOut,
    StoreUpdate,
    UserCreate,
    UserOut,
)
from app.services.dvr import auto_detect_channels, encrypt_dvr_password, test_dvr_connectivity

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/stores", response_model=StoreOut)
def create_store(payload: StoreCreate, db: Session = Depends(get_db)) -> Store:
    existing = db.scalar(select(Store).where(Store.store_code == payload.store_code))
    if existing:
        raise HTTPException(status_code=409, detail="Store code already exists")
    store = Store(**payload.model_dump())
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


@router.get("/stores", response_model=list[StoreOut])
def list_stores(search: str | None = None, db: Session = Depends(get_db)) -> list[Store]:
    stmt = select(Store)
    if search:
        stmt = stmt.where(
            or_(
                Store.store_code.ilike(f"%{search}%"),
                Store.store_name.ilike(f"%{search}%"),
                Store.city.ilike(f"%{search}%"),
            )
        )
    return list(db.scalars(stmt.order_by(Store.store_code)))


@router.put("/stores/{store_id}", response_model=StoreOut)
def update_store(store_id: int, payload: StoreUpdate, db: Session = Depends(get_db)) -> Store:
    store = db.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(store, key, value)
    db.commit()
    db.refresh(store)
    return store


@router.delete("/stores/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(store_id: int, db: Session = Depends(get_db)) -> None:
    store = db.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    db.delete(store)
    db.commit()


@router.post("/dvrs", response_model=DVROut)
def create_dvr(payload: DVRCreate, db: Session = Depends(get_db)) -> DVROut:
    store = db.scalar(select(Store).where(Store.store_code == payload.store_code))
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    dvr = DVRDevice(
        store_id=store.id,
        dvr_ip=payload.dvr_ip,
        port=payload.port,
        username=payload.username,
        password_encrypted=encrypt_dvr_password(payload.password),
        dvr_model=payload.dvr_model,
        channels=payload.channels,
    )
    db.add(dvr)
    db.flush()
    auto_detect_channels(db, dvr)
    db.commit()
    db.refresh(dvr)
    return _to_dvr_out(dvr)


@router.get("/dvrs", response_model=list[DVROut])
def list_dvrs(store_code: str | None = None, db: Session = Depends(get_db)) -> list[DVROut]:
    stmt = select(DVRDevice).join(Store)
    if store_code:
        stmt = stmt.where(Store.store_code == store_code)
    dvrs = list(db.scalars(stmt.order_by(DVRDevice.id)))
    return [_to_dvr_out(dvr) for dvr in dvrs]


@router.put("/dvrs/{dvr_id}", response_model=DVROut)
def update_dvr(dvr_id: int, payload: DVRUpdate, db: Session = Depends(get_db)) -> DVROut:
    dvr = db.get(DVRDevice, dvr_id)
    if not dvr:
        raise HTTPException(status_code=404, detail="DVR not found")
    update_data = payload.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["password_encrypted"] = encrypt_dvr_password(update_data.pop("password"))
    channels_before = dvr.channels
    for key, value in update_data.items():
        setattr(dvr, key, value)
    if dvr.channels != channels_before:
        db.execute(delete(CameraChannel).where(CameraChannel.dvr_id == dvr.id))
        auto_detect_channels(db, dvr)
    db.commit()
    db.refresh(dvr)
    return _to_dvr_out(dvr)


@router.delete("/dvrs/{dvr_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dvr(dvr_id: int, db: Session = Depends(get_db)) -> None:
    dvr = db.get(DVRDevice, dvr_id)
    if not dvr:
        raise HTTPException(status_code=404, detail="DVR not found")
    db.delete(dvr)
    db.commit()


@router.post("/dvrs/{dvr_id}/test-connectivity", response_model=DVRConnectivityResult)
def test_connectivity(dvr_id: int, db: Session = Depends(get_db)) -> DVRConnectivityResult:
    dvr = db.get(DVRDevice, dvr_id)
    if not dvr:
        raise HTTPException(status_code=404, detail="DVR not found")
    reachable, message = test_dvr_connectivity(dvr)
    dvr.status = DeviceStatus.online if reachable else DeviceStatus.offline
    dvr.last_checked_at = datetime.now(timezone.utc)
    db.commit()
    return DVRConnectivityResult(
        dvr_id=dvr.id,
        reachable=reachable,
        checked_at=dvr.last_checked_at,
        message=message,
    )


@router.post("/dvrs/{dvr_id}/auto-detect", response_model=DVROut)
def detect_channels(dvr_id: int, db: Session = Depends(get_db)) -> DVROut:
    dvr = db.get(DVRDevice, dvr_id)
    if not dvr:
        raise HTTPException(status_code=404, detail="DVR not found")
    auto_detect_channels(db, dvr)
    db.commit()
    db.refresh(dvr)
    return _to_dvr_out(dvr)


@router.post("/bulk-onboarding", response_model=BulkOnboardResult)
async def bulk_onboard(file: UploadFile = File(...), db: Session = Depends(get_db)) -> BulkOnboardResult:
    content = await file.read()
    stream = io.StringIO(content.decode("utf-8"))
    reader = csv.DictReader(stream)

    stores_created = 0
    dvrs_created = 0
    errors: list[str] = []

    for line_no, row in enumerate(reader, start=2):
        try:
            store_code = _row_value(row, "store_code")
            store_name = _row_value(row, "store_name")
            city = _row_value(row, "city")
            store_type = _normalize_store_type(_row_value(row, "store_type", "type", default="store"))
            dvr_ip = _row_value(row, "dvr_ip")
            dvr_port = int(_row_value(row, "dvr_port", "port", default="554"))
            username = _row_value(row, "username")
            password = _row_value(row, "password")
            dvr_brand = _row_value(row, "dvr_brand", "dvr_model", default="Unknown")
            channels = int(_row_value(row, "channels", default="4"))

            store = db.scalar(select(Store).where(Store.store_code == store_code))
            if not store:
                store = Store(
                    store_code=store_code,
                    store_name=store_name,
                    city=city,
                    type=store_type,
                )
                db.add(store)
                db.flush()
                stores_created += 1

            dvr = DVRDevice(
                store_id=store.id,
                dvr_ip=dvr_ip,
                port=dvr_port,
                username=username,
                password_encrypted=encrypt_dvr_password(password),
                dvr_model=dvr_brand,
                channels=channels,
            )
            db.add(dvr)
            db.flush()
            auto_detect_channels(db, dvr)
            dvrs_created += 1
        except Exception as exc:  # noqa: BLE001
            errors.append(f"Line {line_no}: {exc}")

    db.commit()
    return BulkOnboardResult(stores_created=stores_created, dvrs_created=dvrs_created, errors=errors)


@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail="User email already exists")
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc())))


@router.post("/users/{user_id}/reset-password", response_model=UserOut)
def reset_password(user_id: int, payload: PasswordResetRequest, db: Session = Depends(get_db)) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    db.refresh(user)
    return user


def _to_dvr_out(dvr: DVRDevice) -> DVROut:
    return DVROut(
        id=dvr.id,
        store_code=dvr.store.store_code,
        dvr_model=dvr.dvr_model,
        channels=dvr.channels,
        status=dvr.status,
        last_checked_at=dvr.last_checked_at,
        cameras=list(dvr.cameras),
    )


def _row_value(row: dict[str, str], *keys: str, default: str | None = None) -> str:
    for key in keys:
        value = row.get(key)
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    if default is not None:
        return default
    raise ValueError(f"Missing required column value: {', '.join(keys)}")


def _normalize_store_type(value: str) -> str:
    normalized = value.strip().lower()
    if normalized == "warehouse":
        return "warehouse"
    return "store"
