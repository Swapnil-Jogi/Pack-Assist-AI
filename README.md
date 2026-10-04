# Pack-Assist AI 📦🥗
### Enterprise AI-Based Food Packaging Material Recommendation System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.3+-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Pack-Assist AI** is a production-hardened, enterprise-grade web application and machine learning engine designed for food technologists, material scientists, and packaging engineers. It calculates pinpoint polymer selections, barrier transmission criteria (**OTR & WVTR**), **Modified Atmosphere Packaging (MAP) gas headspaces**, and circular end-of-life disposal streams to maximize food shelf life while minimizing environmental impact.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Browser / Client     │
                                  │ (EJS, Bootstrap 5.3,   │
                                  │  Tailwind, Chart.js)   │
                                  └───────────┬────────────┘
                                              │ HTTP / Cookies / JWT
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Express.js Production Hardened Core                        │
│                                                                                 │
│   ├── Security: Helmet HTTP Headers, Rate Limiting (express-rate-limit), CORS   │
│   ├── Performance: Compression (gzip/deflate), MongoStore session pooling       │
│   ├── Observability: Morgan HTTP logging, /health & /api/v1/health probes       │
│   ├── Auth: Passport (bcrypt local session) + Passport JWT (Bearer token)       │
│   ├── Protection: IDOR-protected user object authorization across all records   │
│   ├── Lifecycle: Clean graceful shutdown handlers (SIGTERM / SIGINT)            │
│   └── Document Engine: PDFKit ASTM D3985 / F1249 industrial datasheet streamer  │
└──────────────────────────┬─────────────────────────────┬────────────────────────┘
                           │                             │
             Child Process / REST JSON                   │ Mongoose ODM (Pool: 10-20)
                           ▼                             ▼
┌──────────────────────────────────────────┐    ┌─────────────────────────────────┐
│     Python AI/ML Microservice            │    │     MongoDB Database            │
│                                          │    │  (Atlas Cluster or Local)       │
│  ├── Framework: FastAPI / Uvicorn        │    │                                 │
│  ├── Pipeline: Scikit-Learn Pipeline     │    │  ├── Users Collection           │
│  │   (ColumnTransformer, RandomForest)   │    │  ├── Sessions Collection        │
│  ├── Physics: Mass Transfer, OTR & WVTR  │    │  └── Recommendations Collection │
│  └── Degradation: Polymer Chemistry Bio  │    └─────────────────────────────────┘
└──────────────────────────┘
```

---

## 🛡️ Enterprise Production Features

- **Robust Security Perimeter:**
  - **Helmet Security Headers:** Protects against XSS, clickjacking, MIME sniffing, and enforces Strict-Transport-Security (HSTS).
  - **Rate Limiting Protection:** Configured tiered rate limiters (`middleware/rateLimiter.js`) protecting against DDoS and credential brute-force attacks on auth endpoints.
  - **IDOR Protection:** Object-level authorization prevents unauthorized users from inspecting or deleting foreign assessment records.
  - **Production Error Masking:** Sanitizes stack traces and database internal messages on production responses.
- **High Performance & Scalability:**
  - **HTTP Response Compression:** Gzip/Deflate compression via `compression`.
  - **Persistent Session Storage:** Uses `connect-mongo` (`MongoStore`) with automatic fallback to memory store for zero-downtime local previews.
  - **Mongoose Connection Pooling:** Pre-configured socket timeouts, pool sizes, and reconnect resilience.
- **DevOps & Cloud Ready:**
  - **Health Probes:** Liveness and readiness endpoints at `GET /health` and `GET /api/v1/health`.
  - **Zero-Downtime Graceful Shutdown:** Gracefully drains in-flight requests and closes database connections on `SIGTERM` / `SIGINT`.
  - **Multi-Cloud Deployments:** First-class support for Docker containers, Render Blueprint (`render.yaml`), Railway, AWS ECS, GCP Cloud Run, and Heroku.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | EJS (Embedded JavaScript), Bootstrap 5.3, Tailwind CSS CDN, Font Awesome 6, Chart.js 4 |
| **Backend Core** | Node.js (v18+), Express 5, `express-session`, `connect-mongo`, `passport`, `bcryptjs`, `jsonwebtoken`, `helmet`, `compression`, `express-rate-limit`, `morgan` |
| **Machine Learning** | Python 3, Scikit-Learn, Pandas, NumPy, FastAPI, Uvicorn, Joblib |
| **Datasheet Engine** | PDFKit (Streaming vector PDF generation) |
| **Database** | MongoDB & Mongoose ODM (with automatic resilient in-memory fallback) |
| **Containers & Cloud** | Docker (`Dockerfile`, `.dockerignore`), Render (`render.yaml`), Procfile |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** v18+ & **npm**
- **Python** v3.10+ & **pip**
- *(Optional)* **Docker**

### 2. Install Dependencies
```bash
# Clone the repository
git clone https://github.com/Ignite_Coders/pack-assist-ai.git
cd pack-assist-ai

# Install Node.js dependencies
npm install

# Install Python ML dependencies
pip install -r requirements.txt
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Train the ML Model
```bash
npm run ml:train
```

### 5. Launch the Server
```bash
# Start production server
npm start

# Or run in development mode
npm run dev
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser!

---

## 🐳 Docker Deployment

Build and run the containerized application with a single command:

```bash
# Build the Docker image
docker build -t pack-assist-ai:latest .

# Run container with port mapping and environment variables
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e SESSION_SECRET="your_production_secret" \
  -e JWT_SECRET="your_jwt_secret" \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/pack-assist-ai" \
  --name pack-assist-ai-app \
  pack-assist-ai:latest
```

Check container health:
```bash
docker inspect --format='{{json .State.Health}}' pack-assist-ai-app
```

---

## ☁️ Cloud Platform Deployments

### Render.com (Recommended)
This repository includes a tested `render.yaml` blueprint.
1. Connect this repository to your [Render](https://render.com) dashboard.
2. Click **Blueprints** -> **New Blueprint Instance**.
3. Provide your `MONGODB_URI` environment variable.
4. Render automatically configures health checks (`/health`), builds Node & Python dependencies, trains the model, and launches the application.

---

## 📡 REST API & Health Probes

### Health Check Probe
```bash
curl http://localhost:8080/health
```
**Response:**
```json
{
  "status": "ok",
  "service": "pack-assist-ai",
  "uptime": 124,
  "timestamp": "2026-10-04T18:35:04.172Z",
  "environment": "production",
  "database": "connected",
  "memoryUsage": {
    "rssMb": 91,
    "heapUsedMb": 31
  },
  "version": "1.0.0"
}
```

### JWT Authentication
```bash
curl -X POST http://localhost:8080/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"scientist@packassist.ai","password":"PackAssist2026!"}'
```

### Run Packaging Recommendation via API
```bash
curl -X POST http://localhost:8080/api/v1/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "commodity_name": "Organic Blueberries",
    "commodity_type": "Fresh Produce",
    "moisture_content": 85.0,
    "fat_content": 0.3,
    "respiration_rate": "High",
    "shelf_life_days": 14
  }'
```

---

## 📄 License
This project is licensed under the MIT License.
