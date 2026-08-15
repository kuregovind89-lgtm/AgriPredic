# 🌾 AgriPredic – Crop Disease & Risk Prediction

An AI-powered full-stack platform that helps farmers detect crop diseases
from leaf photos, get treatment/fertilizer/prevention advice, check
weather-based outbreak risk, track crop health history, and view market
prices — with a full admin panel for managing the platform.

> **Runs out of the box.** No dataset or trained model required to try it:
> the app ships with a working demo-mode CNN pipeline (OpenCV heuristic)
> so every feature — upload, diagnosis, history, admin analytics — works
> immediately. Train on the real PlantVillage dataset any time to upgrade
> to true deep-learning predictions (see `sample_dataset/README.md`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Recharts, Axios, custom CSS (glassmorphism) |
| Backend | Python, FastAPI |
| AI/ML | TensorFlow (MobileNetV2 transfer learning), OpenCV, NumPy, Pandas |
| Database | SQLAlchemy ORM — SQLite by default (zero config), MySQL-ready |
| Auth | JWT (python-jose) + bcrypt password hashing |
| Extras | PDF reports (ReportLab), Web Speech API voice assistant (EN/Marathi), Open-Meteo weather API |

---

## Folder Structure

```
AgriPredic/
├── backend/
│   ├── main.py                 # FastAPI app entrypoint
│   ├── database.py             # DB engine/session (SQLite/MySQL)
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── auth.py                  # JWT + password hashing
│   ├── database_schema.sql      # Reference MySQL schema
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── auth_routes.py
│   │   ├── predict_routes.py
│   │   ├── history_routes.py
│   │   ├── admin_routes.py
│   │   ├── weather_routes.py
│   │   └── market_routes.py
│   ├── ml/
│   │   ├── model_def.py         # CNN architecture (MobileNetV2)
│   │   ├── train.py             # Training script for PlantVillage
│   │   ├── preprocess.py        # OpenCV preprocessing pipeline
│   │   ├── predict.py           # Inference (+ demo-mode fallback)
│   │   └── disease_info.py      # Treatment/fertilizer/prevention KB
│   └── uploads/                 # Uploaded leaf images (runtime)
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.js / App.css
│       ├── api/api.js           # Axios client
│       ├── context/             # Auth + Theme (dark/light) contexts
│       ├── components/          # Sidebar, Topbar, VoiceAssistant, etc.
│       ├── pages/                # Login, Register, Dashboard, Upload,
│       │                          # History, WeatherRisk, MarketPrice, Admin
│       └── styles/theme.css     # Glassmorphism design tokens
├── sample_dataset/               # Dataset folder-structure guide
├── docs/
│   ├── DEPLOYMENT.md
│   └── API_DOCS.md
└── README.md
```

---

## ✅ Prerequisites

- Python 3.10 or 3.11
- Node.js 18+ and npm
- (Optional) MySQL 8+ if you don't want the default SQLite file
- (Optional) A GPU for faster CNN training on the full PlantVillage dataset

---

## 🚀 Step-by-Step: Run Locally

### 1.  the project
```bash

cd AgriPredic
```

### 2. Backend setup
```bash
cd backend
python -m venv venv

# Activate the virtual environment
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open .env and edit SECRET_KEY, and DB_URL if you want MySQL instead of SQLite
```

Run the API server:
```bash
uvicorn main:app --reload --port 8000
```
- API base URL: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- On first run, a default admin account is auto-created:
  - Email: `admin@agripredic.com`
  - Password: `Admin@123`
  (change these in `.env` before deploying anywhere real)

### 3. Frontend setup
Open a **new terminal window** (keep the backend running):
```bash
cd AgriPredic/frontend
npm install
npm start
```
- App runs at `http://localhost:3000`
- It talks to the backend at `http://localhost:8000` by default. To point
  elsewhere, create `frontend/.env` with:
  ```
  REACT_APP_API_URL=http://localhost:8000
  ```

### 4. Try it out
1. Go to `http://localhost:3000`, click **Create an account**, register as a farmer.
2. Log in, go to **Detect Disease**, upload a leaf photo (jpg/png).
3. View the diagnosis, treatment/fertilizer/prevention advice, and download a PDF report.
4. Check **Weather Risk** by typing a city name (uses live Open-Meteo data).
5. Check **Market Prices** and **Crop History**.
6. Log in as admin (`admin@agripredic.com` / `Admin@123`) to see the **Admin Panel**:
   manage users, manage the disease knowledge base, view all predictions, and analytics charts.
7. Try the 🎙️ voice assistant icon in the top bar (English/Marathi) — say "upload image" or "show weather" (requires Chrome/Edge for Web Speech API support).

---

## 🧠 Training the Real CNN Model (optional, for production-grade accuracy)

By default the app runs in **DEMO MODE** using an OpenCV color-heuristic
so you can test every feature without any dataset. To use a real trained
CNN:

```bash
cd backend
# Download PlantVillage dataset: https://www.kaggle.com/datasets/emmarex/plantdisease
# Arrange it as one folder per class, see sample_dataset/README.md

python ml/train.py --data_dir /path/to/plantvillage_dataset --epochs 15
```
This saves `ml/saved_model/agripredic_model.h5` and
`ml/saved_model/class_indices.json`. Restart the backend — `ml/predict.py`
automatically detects and loads the trained model, no other changes needed.

---

## 🗄️ Using MySQL instead of SQLite

1. Create the database:
   ```bash
   mysql -u root -p < backend/database_schema.sql
   ```
2. In `backend/.env`, set:
   ```
   DB_URL=mysql+pymysql://<user>:<password>@localhost:3306/agripredic
   ```
3. Restart the backend. SQLAlchemy will use MySQL and auto-create any
   missing tables.

---

## 📦 Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for Docker, cloud hosting
(Render/Railway/AWS/GCP), and production environment checklist.

## 📖 API Reference

See [`docs/API_DOCS.md`](docs/API_DOCS.md) for every endpoint with example requests.

---

## 🔭 Future Scope

- IoT soil/climate sensor ingestion feeding directly into the weather-risk model
- Multi-language expansion beyond English/Marathi for the voice assistant
- Mobile app (React Native) wrapping the same backend APIs
- Satellite/drone imagery support for field-level (not just single-leaf) analysis

---

## License

Provided as a project scaffold for educational/portfolio use. Attach your
own license before public/commercial distribution. The PlantVillage
dataset (if you download it) has its own license terms — review before
redistributing trained weights.
