# Deployment Guide

This covers taking AgriPredic from local dev to a live deployment.

## 1. Backend (FastAPI)

### Option A — Docker (recommended)
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && \
    pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
Build & run:
```bash
docker build -t agripredic-backend ./backend
docker run -p 8000:8000 --env-file backend/.env agripredic-backend
```

### Option B — Bare metal / VM
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```
Put Nginx or Caddy in front for TLS termination, and run uvicorn under
`systemd` or `supervisord` so it restarts on failure.

### Cloud targets that work well
- Render / Railway / Fly.io — point at `backend/`, they auto-detect
  `requirements.txt`, set the start command to the uvicorn line above.
- AWS: Elastic Beanstalk, ECS Fargate, or an EC2 instance behind an ALB.
- Google Cloud Run: containerize with the Dockerfile above (Cloud Run is a
  good fit since it scales to zero when idle).

### Database in production
Set `DB_URL` in `.env` to your managed MySQL instance, e.g.:
```
DB_URL=mysql+pymysql://user:password@your-db-host:3306/agripredic
```
Managed options: AWS RDS MySQL, PlanetScale, or Railway MySQL.
Run `backend/database_schema.sql` once against a fresh database if you
prefer manual provisioning (SQLAlchemy will also auto-create tables on
first app startup either way).

### File storage
Uploaded leaf images are stored under `backend/uploads/`. For a multi
instance deployment, move this to S3 / GCS and update
`routers/predict_routes.py` to write there instead of local disk.

## 2. Frontend (React)

Build the production bundle:
```bash
cd frontend
npm install
npm run build
```
This outputs static files to `frontend/build/`. Deploy that folder to:
- Vercel / Netlify (drag-and-drop `build/` or connect the repo, build
  command `npm run build`, output dir `build`)
- Any static host / S3 + CloudFront / Nginx serving static files

Set the API URL for the deployed backend before building:
```bash
# frontend/.env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 3. CORS

In `backend/main.py`, replace the wildcard CORS origin with your real
frontend domain before going live:
```python
allow_origins=["https://your-frontend-domain.com"]
```

## 4. Environment checklist

- [ ] Strong random `SECRET_KEY` in backend `.env`
- [ ] Production `DB_URL` (MySQL) configured
- [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` changed from defaults
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS restricted to your real frontend origin
- [ ] Trained model file (`ml/saved_model/agripredic_model.h5`) present if
      you want real CNN predictions instead of demo-mode heuristics

## 5. Optional integrations to wire up for production

- **Email notifications**: fill in `SMTP_*` vars in `.env` and add a small
  `smtplib` call in `predict_routes.py` after a prediction is saved.
- **Real market price API**: swap the mock list in
  `routers/market_routes.py` for a live data source (e.g. India's
  Agmarknet API via data.gov.in).
- **IoT sensors (future scope)**: expose a new `/api/iot/ingest` endpoint
  that accepts sensor payloads (soil moisture, temperature) and feed them
  into `weather_routes.py`'s risk heuristic for a hybrid weather+sensor
  risk score.
