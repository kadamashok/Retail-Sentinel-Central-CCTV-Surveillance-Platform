from datetime import datetime, timedelta, timezone
from urllib.parse import quote
from uuid import uuid4

from app.core.config import settings
from app.models import CameraChannel, DVRDevice
from app.services.dvr import decrypt_dvr_password

_STREAM_TTL_MINUTES = 5
_stream_token_store: dict[str, dict] = {}


def build_rtsp_url(dvr: DVRDevice, camera: CameraChannel) -> str:
    user = quote(dvr.username, safe="")
    password = quote(decrypt_dvr_password(dvr.password_encrypted), safe="")
    return f"rtsp://{user}:{password}@{dvr.dvr_ip}:{dvr.port}{camera.rtsp_path}"


def build_go2rtc_webrtc_url(rtsp_url: str) -> str:
    encoded = quote(rtsp_url, safe="")
    return f"{settings.media_webrtc_base_url}/webrtc.html?src={encoded}"


def create_stream_token(rtsp_url: str) -> str:
    token = uuid4().hex
    _stream_token_store[token] = {
        "rtsp_url": rtsp_url,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=_STREAM_TTL_MINUTES),
    }
    return token


def resolve_stream_token(token: str) -> str | None:
    data = _stream_token_store.get(token)
    if not data:
        return None
    if datetime.now(timezone.utc) > data["expires_at"]:
        _stream_token_store.pop(token, None)
        return None
    return data["rtsp_url"]
