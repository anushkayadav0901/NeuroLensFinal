<div align="center">

# 🧠 NeuroLens

### Brain MRI → 3D insight · clinical reasoning · patient-safe reporting

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0B1220?style=for-the-badge&logo=fastapi&logoColor=38BDF8&labelColor=111827" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_18-0B1220?style=for-the-badge&logo=react&logoColor=38BDF8&labelColor=111827" alt="React" />
  <img src="https://img.shields.io/badge/Vite-0B1220?style=for-the-badge&logo=vite&logoColor=38BDF8&labelColor=111827" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-0B1220?style=for-the-badge&logo=threedotjs&logoColor=38BDF8&labelColor=111827" alt="Three.js" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-0B1220?style=for-the-badge&logo=googlegemini&logoColor=38BDF8&labelColor=111827" alt="Gemini" />
</p>

<sub>🔬 Research & education prototype — <b>decision support only</b>, not a medical device.</sub>

</div>

---

<h2 id="demo">🎬 Prototype & showcase</h2>

**Watch the walkthrough (Google Drive):** [▶️ NeuroLens prototype video](https://drive.google.com/file/d/1ONlBuKJN0A5EsGpKo3KHZVGlu-yBi_KL/view?usp=sharing)

<img width="1853" height="772" alt="image" src="https://github.com/user-attachments/assets/c25836c4-891b-450d-8637-e0e56055ec16" />

<img width="1538" height="752" alt="image" src="https://github.com/user-attachments/assets/f46dc041-e456-4211-a78d-0ff650d385d1" />

<img width="1355" height="570" alt="image" src="https://github.com/user-attachments/assets/8e556888-84b9-4e92-9119-c324cf71517f" />

<img width="1855" height="777" alt="image" src="https://github.com/user-attachments/assets/e5cbc1f4-a454-4345-b027-712b64b2381b" />

<img width="1860" height="767" alt="image" src="https://github.com/user-attachments/assets/b4c8e1ec-2ea1-4680-a712-401a462b583d" />

<img width="1078" height="606" alt="image" src="https://github.com/user-attachments/assets/923a586c-d389-47fd-a942-a2ea4a76ede5" />

<img width="1090" height="586" alt="image" src="https://github.com/user-attachments/assets/c6ea6851-8574-49a0-afa5-eb41d9807518" />

---

## 📑 Contents

- [Prototype & showcase](#demo)
- [What NeuroLens does](#what-neurolens-does)
- [Features explained](#features-explained)
- [Routes (who sees what)](#routes-who-sees-what)
- [Quick start](#quick-start-run-locally)
- [Environment variables](#environment-variables)
- [ML & BraTS (optional)](#ml-brats)
- [Project layout](#project-layout)
- [API overview](#api-overview)
- [Tech stack](#tech-stack)
- [Acknowledgments](#acknowledgments)

---

## 🎯 What NeuroLens does

NeuroLens is a **full-stack demo** for exploring brain MRI: you upload a study (or use bundled / BraTS data), the backend runs **segmentation and metrics**, and the browser shows **3D meshes**, **2D slices**, **clinical-style fields**, and **AI-assisted review** — all in one cohesive workflow.

**Why it exists:** to make tumor context **visible** (volume, shape, location), **explainable** (heatmaps, reasoning snippets), and **discussable** (Gemini-powered validation chat for doctors, patient-friendly summaries, optional voice for busy hands). Nothing here replaces a radiologist or a certified device; it is a **sandbox for teaching, portfolios, and research UI**.

---

## ✨ Features explained

### 🏠 Landing & story

The public landing page sets the tone: hero, short product narrative, and **interactive teasers** (risk, anatomy, chat-style demos) so a visitor understands what NeuroLens tries to solve before they sign in. Scroll-driven sections keep it readable on long reads.

### 👩‍⚕️ Doctor hub

Clinicians land on a **gate + hub**: they can start a new study or open **saved work**. Studies you care about persist **locally** (today’s list + history), so demos survive refresh without a full backend account system.

### 📤 Upload flow

Upload is intentionally **one job**: drop a zip / NIfTI-style volume (or multimodal BraTS zip), hit **Analyze**, and wait for the pipeline. When analysis finishes, you are routed straight into **Review** so the first screen is always the 3D + AI context, not a maze of menus.

### 🔬 Review (results)

**Review** is the “single pane of glass” for the heavy lifting: a **Three.js** 3D viewer of brain + tumor meshes, side by side with the **AI validation** panel (Gemini 2.5 Flash, JSON-shaped answers). From here you can kick off **report preview / export** without losing the viewport — the shell stays **locked** so the 3D context does not jump away mid-thought.

### 🏥 Clinical workspace

**Clinical** opens when you need **surgery-adjacent storytelling**: textual summaries, **anatomical risk radar** (proximity to critical structures when atlas data is available), planning cards, **2D slice navigation**, and the **heatmap workspace** where the API exposes attention-style overlays. A short **heatmap rationale** from the backend helps connect pixels to words.

### 🤝 Patient view

After a doctor has run an analysis, **Patient** offers a calmer, non-jargon summary of the same underlying result — useful for **education** and “what we found” conversations, still clearly framed as non-diagnostic.

### 📚 Learning mode

**Learning** ties into **BraTS-style cases**: browse cases, walk through steps, earn **XP / badges** stored locally. Good for workshops and self-paced practice without shipping a separate LMS.

### 🎤 Voice (optional)

**Voice hints** wire optional speech recognition for **hands-busy demos** — navigate or trigger simple actions where the browser allows it.

### 🧩 Under the hood (pipeline)

Segmentation tries the **best path first** (e.g. pre-supplied mask or a loaded Keras / MONAI model), then falls back to **heuristics** so a conference laptop always gets a mesh and numbers. Offline benchmark numbers in older docs are **R&D context**, not regulatory claims.

---

## 🗺️ Routes (who sees what)

| Path | Who / what |
|------|------------|
| `/` | Public landing + product story |
| `/doctor` | Doctor hub — sign-in, start study, saved reports |
| `/doctor/study/upload` | Upload only |
| `/doctor/study/results` | **Review** — 3D + AI chat |
| `/doctor/study/clinical` | Full **Clinical** workspace |
| `/patient` | Patient-facing summary |
| `/learn` | Learning mode |

Legacy redirects: `/doctor/results` and `/doctor/clinical` → nested `study` routes above.

---

## 🚀 Quick start (run locally)

**You need:** Python 3.9+ · Node.js 18+ · Git

**Backend**

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# Unix:     source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API: `http://127.0.0.1:8000`
- Health: `http://127.0.0.1:8000/health`

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL (+ optional VITE_GEMINI_API_KEY)
npm run dev
```

- App: `http://127.0.0.1:5173`

**Production build:** `cd frontend && npm run build` then `npm run preview` if you want to check `dist/`.

**One-liners:** `pip install -r backend/requirements.txt` · `cd backend && uvicorn app.main:app --reload` · `cd frontend && npm install` · `cd frontend && npm run dev`

---

## 🔐 Environment variables

**`frontend/.env`** (copy from `frontend/.env.example`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | FastAPI base URL |
| `VITE_GEMINI_API_KEY` | from Google AI Studio | AI validation (Gemini 2.5 Flash); optional |

**`backend/.env`** (optional)

| Variable | Purpose |
|----------|---------|
| `NEUROLENS_KERAS_MODEL_PATH` | After `python download_model.py` |
| `NEUROLENS_MODEL_PATH` | PyTorch / MONAI `.pt` |
| `NEUROLENS_BRATS_ROOT` | Local BraTS tree for cases + analysis |

If none are set, the app uses **heuristic** segmentation so demos still run.

---

<h2 id="ml-brats">🧪 Optional: ML models & BraTS</h2>

```bash
cd backend
python download_model.py
# Put the printed NEUROLENS_KERAS_MODEL_PATH into backend/.env
```

```env
NEUROLENS_BRATS_ROOT=C:/path/to/MICCAI_BraTS2020_TrainingData
```

---

## 📁 Project layout

```text
NeuroLensFinal/
├── backend/app/          # FastAPI — main, routes, services
├── backend/requirements.txt
├── backend/download_model.py
├── frontend/src/         # React — pages, components, features
├── frontend/package.json
├── frontend/.env.example
├── docs/screenshots/
└── README.md
```

---

## 🔌 API overview

Base: **`/api/...`** · Reports: **`/api/reports/...`**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analyze` | Upload → analysis + meshes |
| `GET` | `/api/sample-analysis` | Bundled sample |
| `GET` | `/api/brats-cases` | List BraTS IDs |
| `GET` | `/api/brats-analysis/{id}` | One case |
| `GET` | `/api/brats-evaluate/{id}` | vs GT when available |
| `GET` | `/api/model-status` | Active model tier |
| `GET` | `/api/slice-info` | 2D navigator meta |
| `GET` | `/api/slices/{axis}/{index}` | Slice PNG |
| `GET` | `/api/heatmap/{axis}/{index}` | Heatmap tile |
| `GET` | `/api/heatmap-reasoning` | Rationale JSON |
| `GET` | `/api/learning/cases` | Learning metadata |
| `POST` | `/api/reports/validate-report` | Report validation |
| `GET` | `/api/reports/list-reports` | Reports list *(if configured)* |

Shapes match `AppContext.jsx` and the route modules.

---

## 🛠️ Tech stack

- **Frontend:** React 18, React Router 7, Vite 5, Three.js, html2pdf / jsPDF / html2canvas  
- **Backend:** FastAPI, Uvicorn, NumPy, NiBabel, pydicom, scikit-image, SciPy  
- **AI:** Google Generative Language API — Gemini 2.5 Flash + JSON schema  
- **Demo state:** `localStorage` / `sessionStorage`

---

## 🙏 Acknowledgments

BraTS community · Three.js · FastAPI · Vite · [Google AI Studio](https://aistudio.google.com/) for Gemini API keys used in the validation panel.
