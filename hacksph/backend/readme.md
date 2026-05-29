# JalRakshak Health AI - Flask Backend API

Welcome to the backend API for **JalRakshak Health AI – Smart Health Surveillance & Disease Early Warning System**. This Flask service collects surveillance data, processes it through a hybrid AI/ML prediction engine, updates a SQLite database, and broadcasts active disease outbreak alerts.

---

## 🏃 Instructions to Run Locally

### 1. Install Dependencies
Open a terminal in this directory and execute:
```bash
pip install -r requirements.txt
```

### 2. Train Outbreak Model & Generate Dataset
Execute the model training script to generate the synthetic surveillance dataset and train/pickle the RandomForest model:
```bash
python models/train_model.py
```
This exports:
- `data/dataset.csv`: 2500 surveillance records
- `data/model.pkl`: Serialized scikit-learn classification model (`83.2%` accuracy)

### 3. Run the Development Server
```bash
python app.py
```
The server will initialize the SQLite database (`database/database.db`), seed default village coordinates, load the ML model, and begin listening on **`http://127.0.0.1:5000`**.

---

## ⚙️ Core API Endpoints

- **`GET /health`**: API health and version status.
- **`POST /api/report`**: Accept single report, run hybrid ML risk engine, store values, and check alert conditions.
- **`POST /api/bulk-upload`**: Accept offline-stored bulk reports.
- **`GET /api/reports`**: Return all historical reports joined with pre-seeded village coordinates.
- **`GET /api/alerts`**: Return all active outbreak alerts.
- **`GET /api/users`**: List pre-seeded users and roles (ASHA worker, admin).