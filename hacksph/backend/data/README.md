# 🌊 JalRakshak Health AI - Data Warehouse & ML Models Catalog

Welcome to the data warehouse for **JalRakshak Health AI – Disease Early Warning System**. This directory acts as the central data storage and machine learning registry, integrating clinical symptoms, environmental precipitators, historical disaster metrics, and spatial coordinates.

---

## 📂 Directory Layout

```
backend/data/
├── README.md                      <-- This documentation file
├── dataset.csv                    <-- Unified, balanced preprocessed 19-feature dataset
├── leaderboard.csv                <-- Evaluation metrics for the 15 trained ML models
├── model.pkl                      <-- Serialized winning ML model (Gradient Boosting)
├── scaler.pkl                     <-- Serialized StandardScaler fitted on the 19 features
├── model_metadata.pkl             <-- Metadata detailing features, classes, and hyperparameters
├── plots/                         <-- Beautiful generated EDA and validation graphs
│   ├── correlation_matrix.png
│   ├── class_distribution.png
│   ├── outbreak_trends.png
│   ├── season_vs_outbreak.png
│   ├── rainfall_vs_outbreak.png
│   ├── flood_risk_vs_outbreak.png
│   ├── model_leaderboard.png
│   └── best_model_confusion_matrix.png
└── raw/                           <-- Extracted raw Kaggle source datasets
    ├── cholera/                   <-- imdevskp/cholera-outbreak-dataset
    ├── disasters/                 <-- brsdincer/all-natural-disasters-19002021-eosdis
    ├── flood/                     <-- anubhavsaraf/flood-prediction-dataset
    ├── global_flood/              <-- hasibalmuzdadid/global-flood-dataset
    ├── rainfall/                  <-- rajanand/rainfall-in-india
    └── symptoms/                  <-- itachi9604/disease-symptom-description-dataset
```

---

## 📦 Kaggle Source Datasets

We combine 6 distinct raw datasets to derive realistic epidemiological patterns for rural outbreaks:

1. **Cholera Outbreak Cases (`raw/cholera/`)**: Mapped historical cholera outbreaks inside India to align clinical outbreaks with high-precipitation events.
2. **Rainfall in India 1901-2015 (`raw/rainfall/`)**: Tracks annual and monthly precipitation records across standard Indian subdivisions, setting extreme weather thresholds.
3. **EM-DAT Natural Disasters (`raw/disasters/`)**: Historical database of flooding and waterborne epidemics in India from 1900 to 2021.
4. **Flood Prediction (`raw/flood/`)**: Extreme precipitation thresholds and localized water risks in agricultural subdivisions.
5. **Global Flood Metrics (`raw/global_flood/`)**: Correlates month, temperature, and relative humidity during high-water-risk monsoons.
6. **Symptom Mappings (`raw/symptoms/`)**: Mapped clinical records of rural waterborne and vector-borne diseases (`Typhoid`, `Gastroenteritis`/`Cholera`, `Malaria`, `Dengue`, `Jaundice`, `Hepatitis A`, and `Hepatitis E`). All external non-target symptoms are discarded.

---

## 🧠 Mapped 19-Feature Dimensional Vector

Every observation is engineered across **clinical, environmental, temporal, and spatial features**:

| Mapped Dimension | Feature Name | Representation & Ranges |
| :--- | :--- | :--- |
| **Health / Symptoms** | `fever` | Clinical high-fever indicator ($0$ or $1$) |
| | `diarrhea` | Waterborne diarrhea presence ($0$ or $1$) |
| | `vomiting` | Waterborne vomiting presence ($0$ or $1$) |
| | `symptom_severity_score` | Sum of symptoms ($fever + diarrhea + vomiting$, range $0-3$) |
| **Water & Sanitation** | `water_contamination` | Contaminated drinking source ($0$ or $1$) |
| | `sanitation_index` | Sanitation quality score (range $0.0 - 1.0$) |
| **Environmental** | `rainfall` | Annual subdivisions precipitation in millimeters (mm) |
| | `rainfall_intensity` | Bucketed rain severity index ($0$=Low, $1$=Medium, $2$=High) |
| | `flood_risk` | Area flooding indicator during extreme rain ($0$ or $1$) |
| | `flood_frequency` | Subdivisions historical flood probability ($0.0 - 1.0$) |
| | `temperature` | Average ambient temperature in Celsius (°C) |
| | `humidity` | Relative atmospheric humidity percentage (%) |
| **Temporal** | `year` | Observation Year (supports historical tracking) |
| | `month` | Mapped calendar month ($1 - 12$) |
| | `season_numeric` | Mapped climate season ($0$=Summer, $1$=Monsoon, $2$=Winter) |
| **Spatial / Location** | `location_numeric` | Label Encoded subdivision index |
| | `region_type` | Regional vulnerability index ($1$=Rural agricultural, $0$=Urban) |
| | `population_density` | Human density index ($0$=Low, $1$=Medium, $2$=High) |
| **Target Variable** | `outbreak` | Epidemiological Outbreak Alert status ($0$ or $1$) |

---

## 🏆 Machine Learning Leaderboard

We trained **15 core classification models** with balanced stratified splits (80/20). The final rankings are below:

| Rank | Machine Learning Model | Accuracy | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🥇 1 | **Gradient Boosting Classifier** | **99.02%** | **99.07%** | **99.44%** | **99.25%** |
| 🥈 2 | Hist Gradient Boosting Classifier | 98.66% | 98.88% | 99.07% | 98.97% |
| 🥉 3 | LightGBM Classifier | 98.41% | 98.33% | 99.25% | 98.79% |
| 4 | CatBoost Classifier | 97.92% | 97.61% | 99.25% | 98.42% |
| 5 | XGBoost (XGBClassifier) | 97.92% | 98.14% | 98.69% | 98.42% |
| 6 | Bagging Classifier | 97.80% | 98.32% | 98.32% | 98.32% |
| 7 | Voting Classifier (RF + XGB + LR) | 97.07% | 97.94% | 97.57% | 97.75% |
| 8 | Stacking Classifier (Ensembles) | 96.94% | 96.70% | 98.69% | 97.69% |
| 9 | Random Forest Classifier | 96.58% | 97.03% | 97.76% | 97.39% |
| 10 | Extra Trees Classifier | 96.58% | 97.92% | 96.82% | 97.37% |
| 11 | Support Vector Machine (SVC) | 96.45% | 97.56% | 97.01% | 97.28% |
| 12 | AdaBoost Classifier | 96.33% | 96.50% | 97.94% | 97.22% |
| 13 | Logistic Regression | 95.23% | 96.62% | 96.07% | 96.34% |
| 14 | K-Nearest Neighbors (KNN) | 94.25% | 94.69% | 96.64% | 95.65% |
| 15 | Gaussian Naive Bayes | 89.73% | 90.63% | 94.02% | 92.29% |

*The **Gradient Boosting Classifier** won the challenge and was serialized as `model.pkl`.*

---

## 📈 Exploring Visualizations

To visualize correlation metrics and demographic breakdowns, check out the plots inside [plots/](file:///c:/New%20folder/Desktop/Hacksphere/HackSphere/hacksph/backend/data/plots):
- [Correlation Matrix](file:///c:/New%20folder/Desktop/Hacksphere/HackSphere/hacksph/backend/data/plots/correlation_matrix.png)
- [Outbreak Class Distribution](file:///c:/New%20folder/Desktop/Hacksphere/HackSphere/hacksph/backend/data/plots/class_distribution.png)
- [Rainfall Boxplot](file:///c:/New%20folder/Desktop/Hacksphere/HackSphere/hacksph/backend/data/plots/rainfall_vs_outbreak.png)
- [Confusion Matrix](file:///c:/New%20folder/Desktop/Hacksphere/HackSphere/hacksph/backend/data/plots/best_model_confusion_matrix.png)
- [Leaderboard Bar Chart](file:///c:/New%20folder/Desktop/Hacksphere/HackSphere/hacksph/backend/data/plots/model_leaderboard.png)
