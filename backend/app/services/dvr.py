from datetime import datetime, timezone
import socket

from sqlalchemy.orm import Session

from app.core.security import decrypt_secret, encrypt_secret
from app.models import CameraChannel, DeviceStatus, DVRDevice


def encrypt_dvr_password(password: str) -> str:
    return encrypt_secret(password)


def decrypt_dvr_password(password_encrypted: str) -> str:
    return decrypt_secret(password_encrypted)


def test_dvr_connectivity(dvr: DVRDevice, timeout_seconds: int = 2) -> tuple[bool, str]:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout_seconds)
    try:
        sock.connect((dvr.dvr_ip, dvr.port))
        return True, "DVR reachable"
    except Exception as exc:  # noqa: BLE001
        return False, f"DVR unreachable: {exc}"
    finally:
        sock.close()


def auto_detect_channels(db: Session, dvr: DVRDevice) -> None:
    existing = {cam.channel_number for cam in dvr.cameras}
    for channel in range(1, dvr.channels + 1):
        if channel in existing:
            continue
        rtsp_path = f"/Streaming/Channels/{channel:02d}1"
        camera = CameraChannel(
            dvr_id=dvr.id,
            channel_number=channel,
            camera_name=f"Camera {channel}",
            rtsp_path=rtsp_path,
            status=DeviceStatus.unknown,
        )
        db.add(camera)
    dvr.last_checked_at = datetime.now(timezone.utc)
