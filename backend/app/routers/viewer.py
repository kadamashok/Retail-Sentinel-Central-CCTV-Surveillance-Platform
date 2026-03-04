from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.deps import get_current_user
from app.db import get_db
from app.models import CameraChannel, DVRDevice, Store
from app.schemas import StreamTokenResponse, ViewerStoreSearchResult
from app.services.streaming import (
    build_go2rtc_webrtc_url,
    build_rtsp_url,
    create_stream_token,
    resolve_stream_token,
)

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/stores", response_model=list[ViewerStoreSearchResult])
def search_stores(
    query: str | None = None,
    city: str | None = None,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
) -> list[ViewerStoreSearchResult]:
    stmt = select(Store).order_by(Store.store_code)
    if query:
        stmt = stmt.where(
            or_(
                Store.store_code.ilike(f"%{query}%"),
                Store.store_name.ilike(f"%{query}%"),
            )
        )
    if city:
        stmt = stmt.where(Store.city.ilike(f"%{city}%"))
    stores = list(db.scalars(stmt))
    results: list[ViewerStoreSearchResult] = []
    for store in stores:
        dvr = next(iter(store.dvrs), None)
        results.append(
            ViewerStoreSearchResult(
                id=store.id,
                store_code=store.store_code,
                store_name=store.store_name,
                city=store.city,
                type=store.type,
                dvr_status=dvr.status if dvr else None,
            )
        )
    return results


@router.get("/stores/{store_code}/cameras")
def list_store_cameras(
    store_code: str,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
) -> list[dict]:
    store = db.scalar(select(Store).where(Store.store_code == store_code))
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    cameras: list[dict] = []
    for dvr in store.dvrs:
        for camera in dvr.cameras:
            cameras.append(
                {
                    "camera_id": camera.id,
                    "camera_name": camera.camera_name,
                    "channel_number": camera.channel_number,
                    "status": camera.status,
                }
            )
    return cameras


@router.get("/streams/{camera_id}", response_model=StreamTokenResponse)
def get_stream_url(
    camera_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
) -> StreamTokenResponse:
    camera = db.get(CameraChannel, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    dvr = db.get(DVRDevice, camera.dvr_id)
    rtsp_url = build_rtsp_url(dvr, camera)
    token = create_stream_token(rtsp_url)
    webrtc_url = f"/api/v1/monitoring/webrtc/{token}"
    return StreamTokenResponse(
        camera_id=camera.id,
        camera_name=camera.camera_name,
        status=camera.status,
        webrtc_url=webrtc_url,
    )


@router.get("/webrtc/{token}")
def resolve_webrtc_link(token: str) -> RedirectResponse:
    rtsp_url = resolve_stream_token(token)
    if not rtsp_url:
        raise HTTPException(status_code=404, detail="Stream token expired or invalid")
    return RedirectResponse(url=build_go2rtc_webrtc_url(rtsp_url), status_code=307)
