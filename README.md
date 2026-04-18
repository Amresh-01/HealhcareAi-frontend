<div align="center">
  <img src="https://via.placeholder.com/150" alt="HealthCareAI Logo" width="120" height="120">
  
  # HealthCareAI
  **The Intelligent, Interlinked Healthcare Ecosystem**
  
  [![Hackathon Submission](https://img.shields.io/badge/Hackathon-Submission-blue.svg)](#)
  [![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)](https://reactjs.org/)
  [![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
  [![ML](https://img.shields.io/badge/ML-FastAPI-009688.svg)](#)
</div>

---

## 🚀 The Brain Behind the Platform
Modern healthcare apps are full of isolated features—a symptom checker here, a calorie scanner there. **HealthCareAI** redefines this by introducing a central **Intelligence Layer**. 

Our platform continuously builds a unified `User Health Profile`. Every interaction—whether the user analyzes symptoms via NLP, scans a food barcode, or logs their diet—feeds into a localized memory context. Our ML models do the *predicting*, but our Intelligence Layer does the *deciding*, actively protecting users with personalized, cross-referenced recommendations while intelligently routing severe cases to real-time hospital resources.

## ✨ Key Features

### 🧠 The Intelligence Layer (Core Innovation)
- **Central User Health Profile**: Cross-references past diseases, recent symptoms, and dietary habits to prevent isolated, contradictory AI advice.
- **Neural Dietary Recommendation Engine**: Warns users against consuming high-sugar/high-fat items scanned via barcode *only* if their localized profile detects a historical risk flag (like Hypertension or Diabetes).
  
### 🛡️ Privacy & Reliability 
- **HIPAA Privacy Scrubbing**: An edge-compute Regex engine that systematically intercepts and redacts PII (emails, phone numbers, SSNs) *before* data transverses the network to our ML servers.
- **Local Edge Fallback System**: If the cloud ML servers go offline or connection is lost, our web-app gracefully pivots to a localized heuristic scoring engine to ensure patients are never left without triage support.

### 🏥 Ecosystem Microservices
- **Multi-Role Dashboards**: Fully isolated authentication pipelines for Patients, Doctors, and Hospital Management.
- **NLP Health Scanner**: Transforms natural language logs ("I ate 2 slices of pizza today") into distinct nutrition matrices and activity level risk flags.
- **Live Video Consultations & WebSockets**: Instant WebRTC integration for escalated doctor consultations directly from the triage screen.

## 🏗️ Architecture

HealthCareAI operates on a robust microservices architecture:
1. **Client Layer**: React (Vite) + Tailwind 
2. **API Gateway & Core System**: Node.js, Express
3. **Database Layer**: MongoDB (User Context) + Redis (Rapid query caching)
4. **Machine Learning APIs**: Python (FastAPI) handling NLP classification, disease prediction matrices, and smart recommendations.

## 💻 Local Setup
Follow these steps to run the application locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Redis Server (Optional, for caching layer)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/HealthCareAI.git
cd HealthCareAI
```

### 2. Setup the Backend
Navigate to the backend directory, install packages, and set environment variables.
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal tab and navigate to the frontend directory:
```bash
cd frontend/healthCareAi
npm install
```
Start the Vite development server:
```bash
npm run dev
```
The frontend should now be running locally at `http://localhost:5173`.

## 📸 Demo Screenshots
<img width="1918" height="874" alt="Screenshot 2026-04-18 093645" src="https://github.com/user-attachments/assets/db8348b3-143d-42a0-a3e4-ddabd9d2811c" />
<img width="1919" height="874" alt="Screenshot 2026-04-18 094021" src="https://github.com/user-attachments/assets/7e1fe4dd-de9d-4d98-9948-cd0c5859240d" />
<img width="1000" height="858" alt="Screenshot 2026-04-18 095133" src="https://github.com/user-attachments/assets/a3b6fba5-af6c-4f67-b6df-7c4486621278" />
<img width="1919" height="876" alt="Screenshot 2026-04-18 095403" src="https://github.com/user-attachments/assets/2440506a-3c2e-48c1-81b5-2b463f53df94" />


## Architecture Flow Diagram
<img width="1248" height="352" alt="image" src="https://github.com/user-attachments/assets/ee204167-345d-4072-adf2-dfab864d2d32" />
<br>
<img width="1166" height="630" alt="Screenshot 2026-04-03 124920" src="https://github.com/user-attachments/assets/6d0c35e5-e111-4964-a699-027eb9fbe8a9" />


| Intelligent Triage | Barcode Scanning | 
| ------------------- | ---------------- |
| ![Triage](https://via.placeholder.com/400x250) | ![Barcode](https://via.placeholder.com/400x250) |

| Hospital Dashboard | Real-Time Video Call |
| ------------------- | -------------------- |
| ![Hospital](https://via.placeholder.com/400x250) | ![Video](https://via.placeholder.com/400x250) |


## ⚠️ Risks & Real-World Safeguards
We designed HealthCareAI with actual clinical reality in mind. 
* **Model Hallucination Mitigation**: All ML outputs contain clinical disclaimers. 
* **Cold Start Safety**: Our models defer to generalized safety logic when a newly registered user lacks sufficient historical health context.
