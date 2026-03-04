from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Role(str, Enum):
    admin = "admin"
    viewer = "viewer"


class StoreType(str, Enum):
    store = "store"
    warehouse = "warehouse"


class DeviceStatus(str, Enum):
    online = "online"
    offline = "offline"
    unknown = "unknown"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(SqlEnum(Role), default=Role.viewer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    store_code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    store_name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[StoreType] = mapped_column(SqlEnum(StoreType), nullable=False, default=StoreType.store)

    dvrs = relationship("DVRDevice", back_populates="store", cascade="all,delete-orphan")


class DVRDevice(Base):
    __tablename__ = "dvr_devices"
    __table_args__ = (UniqueConstraint("store_id", "dvr_ip", name="uq_store_dvr_ip"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    dvr_ip: Mapped[str] = mapped_column(String(128), nullable=False)
    port: Mapped[int] = mapped_column(Integer, default=554, nullable=False)
    username: Mapped[str] = mapped_column(String(128), nullable=False)
    password_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    dvr_model: Mapped[str] = mapped_column(String(128), nullable=False)
    channels: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    status: Mapped[DeviceStatus] = mapped_column(SqlEnum(DeviceStatus), default=DeviceStatus.unknown, nullable=False)
    last_checked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    store = relationship("Store", back_populates="dvrs")
    cameras = relationship("CameraChannel", back_populates="dvr", cascade="all,delete-orphan")


class CameraChannel(Base):
    __tablename__ = "camera_channels"
    __table_args__ = (UniqueConstraint("dvr_id", "channel_number", name="uq_dvr_channel"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    dvr_id: Mapped[int] = mapped_column(ForeignKey("dvr_devices.id", ondelete="CASCADE"), nullable=False, index=True)
    channel_number: Mapped[int] = mapped_column(Integer, nullable=False)
    camera_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rtsp_path: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[DeviceStatus] = mapped_column(SqlEnum(DeviceStatus), default=DeviceStatus.unknown, nullable=False)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    dvr = relationship("DVRDevice", back_populates="cameras")
