# 🫁 AI-Based Pneumonia Detection System

A full-stack web application that uses AI to detect pneumonia from chest X-ray images.

**Stack:** React.js · Node.js + Express · FastAPI · MongoDB · HOG + Random Forest

---

## Architecture

```
React (port 3000) → Node.js/Express (port 5000) → FastAPI ML Service (port 8000)
                              ↓
                          MongoDB
```

- React never talks to FastAPI directly — all requests go through Node.js
- FastAPI is a pure ML microservice: receives image → returns prediction
- Node.js handles auth, storage, email, and PDF generation

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Community Server (local) or MongoDB Atlas (cloud)
- Git

---

### Step 1 — Download the Trained Model

👉 **[Download pneumonia.pkl from Google Drive](https://drive.google.com/file/d/14dNZsw5SVG2X8ff3bQX-sEkD-MELPO9q/view?usp=drive_link)**

After downloading, place the file here:
```
ml-service/model/pneumonia.pkl
```

> The model file is excluded from git due to its size. Always download it separately before running the ML service.

---

### Step 2 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/pneumonia-detection.git
cd pneumonia-detection
```

---

### Step 3 — Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/pneumonia_db
JWT_SECRET=your_super_secret_key_here_min_32_chars
ML_SERVICE_URL=http://localhost:8000
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

### Step 4 — Install Dependencies

```bash
# Backend
cd backend && npm install

# ML Service
cd ../ml-service && pip install -r requirements.txt

# Frontend
cd ../frontend && npm install
```

---

### Step 5 — Run All Services (4 Terminals)

```bash
# Terminal 1 — MongoDB
mongod

# Terminal 2 — ML Service
cd ml-service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 3 — Backend
cd backend
npm run dev

# Terminal 4 — Frontend
cd frontend
npm run dev
# Opens at http://localhost:3000
```

---

### Step 6 — Verify Everything is Running

```bash
# ML Service health check
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# Backend health check
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
# Expected: {"message":"Invalid email or password"}
```

---

### Step 7 — Open the App

Go to **http://localhost:3000** in your browser.

1. Click **Register** → create your account
2. Go to **Upload X-ray** → select a chest X-ray image (JPG/PNG)
3. Click **Analyze X-ray** → get your prediction
4. View results in **History** → download PDF report
5. Check your email for the detailed report

---

## Gmail App Password Setup (for email reports)

1. Go to [Google Account](https://myaccount.google.com) → Security
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords) → Create
4. Copy the 16-character password (no spaces)
5. Set `EMAIL_PASS=abcdefghijklmnop` in `backend/.env`
6. Restart backend

> **Note:** Use the App Password, NOT your real Gmail password.

---

## Windows Specific Notes

- Use `copy` instead of `cp` in PowerShell
- If `localhost` doesn't work in browser, try `http://127.0.0.1:3000`
- MongoDB runs as a Windows Service — no need to run `mongod` manually if installed with "Install as Service" option
- Run PowerShell as Administrator for hosts file changes

---

## Docker Deployment

```bash
# Place your model first
cp /path/to/pneumonia.pkl ml-service/model/pneumonia.pkl

# Update environment variables in docker-compose.yml, then:
docker-compose up --build
```

App runs at `http://localhost:3000`

---

## Cloud Deployment (Render + Vercel)

| Service     | Platform       | Notes                                                    |
|-------------|----------------|----------------------------------------------------------|
| ML Service  | Render Web Svc | Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`   |
| Backend     | Render Web Svc | Set all env vars in Render dashboard                     |
| Frontend    | Vercel         | Set `VITE_API_URL` to your backend Render URL            |
| Database    | MongoDB Atlas  | Free 512MB tier — update `MONGO_URI` in backend env vars |

---

## API Reference

### Auth
| Method | Endpoint           | Body                      | Response           |
|--------|--------------------|---------------------------|--------------------|
| POST   | /api/auth/register | `{name, email, password}` | `{token, ...user}` |
| POST   | /api/auth/login    | `{email, password}`       | `{token, ...user}` |

### Predict
| Method | Endpoint      | Body (FormData) | Auth | Response                                        |
|--------|---------------|-----------------|------|-------------------------------------------------|
| POST   | /api/predict  | `xray: <file>`  | JWT  | `{prediction, confidence, threshold, reportId}` |

### History
| Method | Endpoint             | Auth | Response            |
|--------|----------------------|------|---------------------|
| GET    | /api/history         | JWT  | `[...reports]`      |
| GET    | /api/history/:id     | JWT  | `report`            |
| GET    | /api/history/:id/pdf | JWT  | PDF binary download |
| DELETE | /api/history/:id     | JWT  | `{message}`         |

### ML Service (Internal)
| Method | Endpoint | Body (multipart) | Response                                   |
|--------|----------|------------------|--------------------------------------------|
| POST   | /predict | `file: <image>`  | `{prediction, confidence, threshold, ...}` |
| GET    | /health  | —                | `{status: "healthy"}`                      |

---

## Model Bundle Format

The `pneumonia.pkl` is a `joblib` bundle with these keys:

```python
bundle = {
    'clf':        trained_random_forest_classifier,
    'scaler':     fitted_standard_scaler,
    'threshold':  0.78,
    'classes':    ['NORMAL', 'PNEUMONIA'],
    'hog_params': {
        'image_size':      (128, 128),
        'orientations':    9,
        'pixels_per_cell': (8, 8),
        'cells_per_block': (2, 2),
    }
}
joblib.dump(bundle, 'pneumonia.pkl')
```

---

## Security Checklist

- [x] Passwords hashed with bcrypt (salt rounds = 10)
- [x] JWT with 7-day expiry and strong secret
- [x] File type validation (MIME + extension)
- [x] File size limit (5MB via multer)
- [x] Environment variables — never committed to git
- [ ] In production: restrict CORS to your frontend domain
- [ ] In production: use AWS S3 / Cloudinary for image storage
- [ ] In production: add rate limiting (express-rate-limit)

---

## Viva / Interview Key Points

| Question | Answer |
|----------|--------|
| Why HOG features? | Captures edge gradients typical of pneumonia consolidations in X-rays |
| Why Random Forest? | Best Macro F1 (0.88), handles non-linear boundaries, robust to outliers |
| Why threshold 0.78? | Tuned to achieve ≥70% Normal recall while maximising Macro F1 |
| Why SMOTE? | Dataset imbalance: 390 Pneumonia vs 234 Normal images |
| Why separate ML service? | Python ML libs (sklearn, skimage) unavailable in Node.js |
| Why JWT? | Stateless auth — no server-side session storage needed |
| Model metrics | 88.8% accuracy · 0.88 Macro F1 · 0.927 ROC-AUC |
| Normal recall before SMOTE | 29% — model always predicted Pneumonia |
| Normal recall after SMOTE | 87% — balanced predictions on both classes |

---

## Project Structure

```
pneumonia-detection/
├── backend/                  ← Node.js + Express
│   ├── config/db.js          ← MongoDB connection
│   ├── middleware/           ← JWT auth middleware
│   ├── models/               ← User & Report schemas
│   ├── routes/               ← Auth, predict, history routes
│   ├── utils/                ← Email & PDF generation
│   └── server.js             ← Entry point
├── ml-service/               ← Python FastAPI
│   ├── model/                ← Place pneumonia.pkl here
│   ├── main.py               ← FastAPI app
│   └── predictor.py          ← HOG + prediction logic
├── frontend/                 ← React.js + Vite
│   └── src/
│       ├── pages/            ← Login, Register, Dashboard, Upload, History
│       ├── components/       ← Navbar, ResultCard, ProtectedRoute
│       └── context/          ← JWT auth context
└── docker-compose.yml
```

---

*⚠️ Disclaimer: This system is AI-assisted and does not replace professional medical diagnosis. Always consult a qualified physician.*
