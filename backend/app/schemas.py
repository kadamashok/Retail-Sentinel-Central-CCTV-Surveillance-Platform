from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import DeviceStatus, Role, StoreType


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=8)
    role: Role = Role.viewer


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: Role
    is_active: bool
    created_at: datetime


class PasswordResetRequest(BaseModel):
    new_password: str = Field(min_length=8)


class StoreBase(BaseModel):
    store_code: str
    store_name: str
    city: str
    type: StoreType


class StoreCreate(StoreBase):
    pass


class StoreUpdate(BaseModel):
    store_name: str | None = None
    city: str | None = None
    type: StoreType | None = None


class StoreOut(StoreBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class DVRBase(BaseModel):
    store_code: str
    dvr_ip: str
    port: int = 554
    username: str
    dvr_model: str
    channels: int = Field(default=4, ge=1, le=64)


class DVRCreate(DVRBase):
    password: str


class DVRUpdate(BaseModel):
    dvr_ip: str | None = None
    port: int | None = None
    username: str | None = None
    password: str | None = None
    dvr_model: str | None = None
    channels: int | None = Field(default=None, ge=1, le=64)


class CameraOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    channel_number: int
    camera_name: str
    status: DeviceStatus


class DVROut(BaseModel):
    id: int
    store_code: str
    dvr_model: str
    channels: int
    status: DeviceStatus
    last_checked_at: datetime | None
    cameras: list[CameraOut]


class DVRConnectivityResult(BaseModel):
    dvr_id: int
    reachable: bool
    checked_at: datetime
    message: str


class BulkOnboardResult(BaseModel):
    stores_created: int
    dvrs_created: int
    errors: list[str]


class ViewerStoreSearchResult(BaseModel):
    id: int
    store_code: str
    store_name: str
    city: str
    type: StoreType
    dvr_status: DeviceStatus | None = None


class StreamTokenResponse(BaseModel):
    camera_id: int
    camera_name: str
    status: DeviceStatus
    webrtc_url: str
