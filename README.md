# Retail Sentinel - Central CCTV Surveillance Platform

A centralized monitoring platform for retail stores and warehouses that allows authorized users to access CCTV DVRs remotely without knowing DVR IP addresses or credentials.

## Developed By
Ashok Kadam using AI with guidance from his son Swarup.

## Project Status
Current implementation includes:
- JWT-based authentication and role-based access control (`admin`, `viewer`)
- Store management (create, update, list, delete)
- DVR management (add, edit, delete, connectivity test, channel auto-detect scaffold)
- Viewer monitoring dashboard with searchable stores and camera grid layouts (4/9/16)
- Bulk onboarding via CSV upload
- Sample CSV template download endpoint for onboarding
- Secure DVR credential storage (encryption at rest)
- Dockerized deployment with PostgreSQL + FastAPI + React + go2rtc

## Tech Stack
- Backend: FastAPI, SQLAlchemy, Pydantic, Passlib, Python-JOSE
- Frontend: React, Vite, Tailwind CSS, Axios
- Database: PostgreSQL 16
- Media Bridge: go2rtc + FFmpeg
- Deployment: Docker Compose

## Architecture
```text
Viewer/Admin Browser (React)
        |
        v
FastAPI Backend (JWT + RBAC + DVR Management)
        |                    \
        |                     \-> go2rtc media service (WebRTC/stream bridge)
        v
PostgreSQL (stores, dvrs, cameras, users)
```

## Project Structure
```text
backend/
  app/
    core/
    routers/
    services/
    db.py models.py schemas.py deps.py main.py
  Dockerfile
  requirements.txt

frontend/
  public/assets/logo.png
  src/
    api/ context/ components/ pages/
  Dockerfile
  package.json

media/go2rtc.yaml
scripts/health-check.ps1
docker-compose.yml
health-check.cmd
.env.example
```

## Local Setup
1. Copy environment file:
```bash
cp .env.example .env
```

2. Set a valid Fernet key in `.env` (`ENCRYPTION_KEY`):
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

3. Start the full stack:
```bash
docker compose up --build -d
```

4. Access services:
- Frontend: `http://localhost:15173`
- Backend API docs: `http://localhost:18000/docs`
- Media bridge: `http://localhost:11984`

## Default Admin
- Email: `admin@retailsentinel.com`
- Password: `Admin@123`

## Health Check
Run from project root:
```bash
health-check.cmd
```
Checks include:
- Docker daemon status
- Running `docker compose` services
- Frontend availability
- Backend docs availability
- Media service availability
- Auth login with configured bootstrap admin

## Bulk Onboarding CSV Format
Headers:
```csv
store_code,store_name,city,store_type,dvr_ip,dvr_port,username,password,dvr_brand,channels
```

Sample row:
```csv
CR001,Croma Thane,Thane,Store,192.168.1.10,554,admin,password123,Hikvision,8
```

Sample file download endpoint:
```text
GET /download-sample-store-template
```

---
Retail Sentinel CCTV Platform  
Developed by Ashok Kadam using AI with guidance from his son Swarup.
