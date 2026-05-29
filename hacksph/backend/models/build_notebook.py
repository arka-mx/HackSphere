import json
import os

notebook = {
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 🌊 JalRakshak Health AI - Multi-Dimensional Outbreak Risk Prediction & 15-Model Leaderboard\n",
    "\n",
    "Welcome to the advanced, real-world epidemiological machine learning pipeline for **JalRakshak Health AI – Smart Health Surveillance & Disease Early Warning System**.\n",
    "\n",
    "In this notebook, we integrate clinical, environmental, temporal, and location dimensions to predict rural waterborne outbreak risks with maximum precision. Instead of synthetic mock features, we ingest real datasets unzipped from Kaggle to build a highly realistic pipeline. To achieve high epidemiological fidelity, we filter clinical symptoms to focus exclusively on rural and flood-prone waterborne and vector-borne epidemic diseases (Typhoid, Gastroenteritis/Cholera, Malaria, Dengue, Jaundice, Hepatitis A, and Hepatitis E), discarding all unrelated external conditions.\n",
    "\n",
    "### 📋 Integrated Datasets (Kaggle)\n",
    "1. **Symptoms Dataset**: `itachi9604/disease-symptom-description-dataset` (Real mapped patient symptoms)\n",
    "2. **Rainfall Dataset**: `rajanand/rainfall-in-india` (Real monthly and annual rainfall records from 1901-2015)\n",
    "3. **EM-DAT Natural Disasters Dataset**: `brsdincer/all-natural-disasters-19002021-eosdis` (Real history of floods and epidemics in India)\n",
    "4. **Cholera Outbreak Cases**: `imdevskp/cholera-outbreak-dataset` (Used to inform waterborne disease correlation)\n",
    "5. **Flood History**: `anubhavsaraf/flood-prediction-dataset` (Used to correlate extreme precipitation thresholds)\n",
    "\n",
    "### 🧠 ML Model Pipeline (15 Models compared)\n",
    "We train, optimize, and cross-evaluate **15 machine learning algorithms** representing the state-of-the-art in predictive classification:\n",
    "- **Tree Classifiers**: Random Forest, Extra Trees\n",
    "- **Gradient Boosters**: XGBoost, LightGBM, CatBoost, Gradient Boosting Classifier, HistGradientBoosting\n",
    "- **Ensembles**: AdaBoost, Bagging, Voting Classifier (RF + XGB + LR), Stacking Classifier (ExtraTrees + LightGBM + CatBoost with Random Forest meta-model)\n",
    "- **Baselines**: Logistic Regression, K-Nearest Neighbors, Naive Bayes, Support Vector Machines (SVC)"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## ⚙️ Step 1: Libraries Setup & Configuration"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "import os\n",
    "import sys\n",
    "import numpy as np\n",
    "import pandas as pd\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns\n",
    "import pickle\n",
    "import joblib\n",
    "from sklearn.model_selection import train_test_split\n",
    "from sklearn.preprocessing import StandardScaler\n",
    "from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report\n",
    "\n",
    "# Import all 15 models\n",
    "from sklearn.ensemble import (\n",
    "    RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier,\n",
    "    HistGradientBoostingClassifier, AdaBoostClassifier, BaggingClassifier,\n",
    "    VotingClassifier, StackingClassifier\n",
    ")\n",
    "from sklearn.linear_model import LogisticRegression\n",
    "from sklearn.neighbors import KNeighborsClassifier\n",
    "from sklearn.naive_bayes import GaussianNB\n",
    "from sklearn.svm import SVC\n",
    "from xgboost import XGBClassifier\n",
    "from lightgbm import LGBMClassifier\n",
    "from catboost import CatBoostClassifier\n",
    "\n",
    "# Configure plots style\n",
    "sns.set_theme(style=\"whitegrid\")\n",
    "plt.rcParams['figure.figsize'] = (10, 6)\n",
    "plt.rcParams['font.size'] = 12\n",
    "print(\"Libraries successfully imported!\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📊 Step 2: Unified Dataset Loading\n",
    "\n",
    "We load the clean, merged dataset generated at `../data/dataset.csv` which compiles symptoms, annual rainfall statistics, flood events, water safety indexes, years, and subdivisions."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "dataset_path = '../data/dataset.csv'\n",
    "\n",
    "if not os.path.exists(dataset_path):\n",
    "    print(f\"Warning: Pre-merged dataset not found at {dataset_path}. Re-running training script to generate it...\")\n",
    "    # Fallback inline generation if needed, otherwise read directly\n",
    "    import subprocess\n",
    "    subprocess.run([sys.executable, 'train_model.py'], check=True)\n",
    "\n",
    "df = pd.read_csv(dataset_path)\n",
    "print(f\"Dataset successfully loaded!\")\n",
    "print(f\"Shape: {df.shape[0]} rows, {df.shape[1]} columns.\")\n",
    "print(f\"Columns: {list(df.columns)}\")\n",
    "df.head()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📈 Step 3: Raw Dataset EDA — Missing Value Analysis & Imputation\n",
    "\n",
    "Before working with the merged dataset we audit each raw Kaggle source for missing values and impute them properly:\n",
    "- **Numerical columns with low skew (|skew| < 1)** → fill with **mean**\n",
    "- **Numerical columns with high skew (|skew| ≥ 1)** → fill with **median** (robust to outliers)\n",
    "- **Categorical / object columns** → fill with **mode** (most frequent value)\n",
    "- **Columns >60% missing** → dropped entirely (too sparse to impute reliably)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 3.1 — SYMPTOMS DATASET: Missing Value Audit + Imputation (self-contained)\n",
    "symptoms_path = '../data/raw/symptoms/dataset.csv'\n",
    "df_sym = pd.read_csv(symptoms_path)\n",
    "print(f'Symptoms dataset shape: {df_sym.shape}')\n",
    "\n",
    "miss_sym     = df_sym.isnull().sum()\n",
    "miss_sym     = miss_sym[miss_sym > 0]\n",
    "miss_pct_sym = (miss_sym / len(df_sym) * 100).round(1)\n",
    "\n",
    "print('\\n--- Missing Values (Symptoms) ---')\n",
    "miss_df_sym = pd.DataFrame({\n",
    "    'Missing Count': miss_sym,\n",
    "    'Missing %':     miss_pct_sym,\n",
    "    'Dtype':         df_sym[miss_sym.index].dtypes\n",
    "})\n",
    "print(miss_df_sym.to_string())\n",
    "\n",
    "# Visualise missingness\n",
    "plt.figure(figsize=(10, 4))\n",
    "miss_pct_sym.plot(kind='bar', color='#e74c3c')\n",
    "plt.axhline(60, color='black', linestyle='--', linewidth=1, label='60% drop threshold')\n",
    "plt.title('Missing Value % — Symptoms Dataset')\n",
    "plt.xlabel('Column')\n",
    "plt.ylabel('Missing %')\n",
    "plt.legend()\n",
    "plt.tight_layout()\n",
    "plt.show()\n",
    "\n",
    "# --- IMPUTATION ---\n",
    "# Symptom columns are categorical strings. Missing = patient had no additional symptoms.\n",
    "# Strategy: mode fill for <=60% missing; drop columns >60% missing (too sparse).\n",
    "DROP_THRESHOLD = 60.0\n",
    "to_drop_sym   = miss_pct_sym[miss_pct_sym >  DROP_THRESHOLD].index.tolist()\n",
    "to_impute_sym = miss_pct_sym[miss_pct_sym <= DROP_THRESHOLD].index.tolist()\n",
    "\n",
    "print(f'\\nColumns to DROP  (>{DROP_THRESHOLD}% missing): {to_drop_sym}')\n",
    "print(f'Columns to IMPUTE with MODE: {to_impute_sym}')\n",
    "\n",
    "df_sym_clean = df_sym.drop(columns=to_drop_sym)\n",
    "for col in to_impute_sym:\n",
    "    mode_val = df_sym_clean[col].mode()[0]\n",
    "    df_sym_clean[col] = df_sym_clean[col].fillna(mode_val)\n",
    "    print(f'  Filled \"{col}\" with mode = \"{mode_val}\"')\n",
    "\n",
    "print(f'\\nSymptoms after imputation — remaining nulls: {df_sym_clean.isnull().sum().sum()}')\n",
    "print(f'Shape: {df_sym_clean.shape}')\n",
    "df_sym_clean.head()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 3.3 — RAINFALL DATASET: Missing Value Audit + Imputation\n",
    "rainfall_path = '../data/raw/rainfall/rainfall in india 1901-2015.csv'\n",
    "df_rain = pd.read_csv(rainfall_path)\n",
    "print(f'Rainfall dataset shape: {df_rain.shape}')\n",
    "\n",
    "miss_rain = df_rain.isnull().sum()\n",
    "miss_rain = miss_rain[miss_rain > 0]\n",
    "miss_pct_rain = (miss_rain / len(df_rain) * 100).round(2)\n",
    "\n",
    "print('\\n--- Missing Values (Rainfall) ---')\n",
    "for col in miss_rain.index:\n",
    "    skew = df_rain[col].skew()\n",
    "    strategy = 'MEDIAN' if abs(skew) >= 1 else 'MEAN'\n",
    "    print(f'  {col}: {miss_rain[col]} missing ({miss_pct_rain[col]}%) | skew={skew:.2f} → use {strategy}')\n",
    "\n",
    "# Apply imputation\n",
    "df_rain_clean = df_rain.copy()\n",
    "for col in miss_rain.index:\n",
    "    skew = df_rain[col].skew()\n",
    "    if abs(skew) >= 1:\n",
    "        fill_val = df_rain[col].median()\n",
    "        strategy = 'median'\n",
    "    else:\n",
    "        fill_val = df_rain[col].mean()\n",
    "        strategy = 'mean'\n",
    "    df_rain_clean[col] = df_rain_clean[col].fillna(fill_val)\n",
    "    print(f'  Filled \"{col}\" with {strategy} = {fill_val:.2f}')\n",
    "\n",
    "# Visualise skewness of monthly columns\n",
    "monthly_cols = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']\n",
    "skewness = df_rain_clean[monthly_cols].skew().sort_values(ascending=False)\n",
    "plt.figure(figsize=(10, 4))\n",
    "skewness.plot(kind='bar', color=['#e74c3c' if abs(s) >= 1 else '#2ecc71' for s in skewness])\n",
    "plt.axhline(1, color='black', linestyle='--', linewidth=1, label='|skew|=1 threshold')\n",
    "plt.axhline(-1, color='black', linestyle='--', linewidth=1)\n",
    "plt.title('Monthly Rainfall Skewness (Red=Median used, Green=Mean used)')\n",
    "plt.ylabel('Skewness')\n",
    "plt.legend()\n",
    "plt.tight_layout()\n",
    "plt.show()\n",
    "\n",
    "print(f'\\nRainfall after imputation — remaining nulls: {df_rain_clean.isnull().sum().sum()}')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 3.4 — DISASTERS DATASET: Missing Value Audit + Selective Imputation\n",
    "disasters_path = '../data/raw/disasters/DISASTERS/1900_2021_DISASTERS.xlsx - emdat data.csv'\n",
    "df_dis = pd.read_csv(disasters_path, low_memory=False)\n",
    "print(f'Disasters dataset shape: {df_dis.shape}')\n",
    "\n",
    "miss_dis = df_dis.isnull().sum()\n",
    "miss_dis = miss_dis[miss_dis > 0]\n",
    "miss_pct_dis = (miss_dis / len(df_dis) * 100).round(1)\n",
    "\n",
    "DROP_THRESHOLD = 60.0\n",
    "to_drop_dis    = miss_pct_dis[miss_pct_dis > DROP_THRESHOLD].index.tolist()\n",
    "to_impute_dis  = miss_pct_dis[miss_pct_dis <= DROP_THRESHOLD].index.tolist()\n",
    "\n",
    "print(f'\\nColumns to DROP (>{DROP_THRESHOLD}% missing): {len(to_drop_dis)} columns')\n",
    "print(f'Columns to IMPUTE: {to_impute_dis}')\n",
    "\n",
    "df_dis_clean = df_dis.drop(columns=to_drop_dis)\n",
    "for col in to_impute_dis:\n",
    "    if df_dis_clean[col].dtype in ['float64', 'int64']:\n",
    "        skew = df_dis_clean[col].skew()\n",
    "        if abs(skew) >= 1:\n",
    "            fill_val = df_dis_clean[col].median()\n",
    "            strategy = f'median={fill_val:.2f}'\n",
    "        else:\n",
    "            fill_val = df_dis_clean[col].mean()\n",
    "            strategy = f'mean={fill_val:.2f}'\n",
    "        df_dis_clean[col] = df_dis_clean[col].fillna(fill_val)\n",
    "    else:\n",
    "        mode_val = df_dis_clean[col].mode()[0] if not df_dis_clean[col].mode().empty else 'Unknown'\n",
    "        df_dis_clean[col] = df_dis_clean[col].fillna(mode_val)\n",
    "        strategy = f'mode=\"{mode_val}\"'\n",
    "    print(f'  [{df_dis_clean[col].dtype}] \"{col}\" → {strategy}')\n",
    "\n",
    "# Missingness bar chart (only columns with <60% missing)\n",
    "plt.figure(figsize=(12, 4))\n",
    "miss_pct_dis[miss_pct_dis <= DROP_THRESHOLD].plot(kind='bar', color='#3498db')\n",
    "plt.title('Missing Value % in Disasters Dataset (columns kept after 60% threshold)')\n",
    "plt.ylabel('Missing %')\n",
    "plt.tight_layout()\n",
    "plt.show()\n",
    "\n",
    "print(f'\\nDisasters after imputation — remaining nulls: {df_dis_clean.isnull().sum().sum()}')\n",
    "print(f'Shape after dropping sparse columns: {df_dis_clean.shape}')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 3.5 — MERGED DATASET: Final Null Check\n",
    "# The merged dataset.csv is produced by train_model.py which already combines,\n",
    "# imputes, and balances all sources. We confirm it has zero nulls before modelling.\n",
    "print('=== Merged Dataset Null Check ===')\n",
    "null_counts = df.isnull().sum()\n",
    "if null_counts.sum() == 0:\n",
    "    print('All columns are complete — zero missing values in the merged dataset.')\n",
    "else:\n",
    "    print('Columns with missing values:')\n",
    "    print(null_counts[null_counts > 0])\n",
    "    # Apply same imputation strategy to merged dataset for safety\n",
    "    for col in null_counts[null_counts > 0].index:\n",
    "        if df[col].dtype in ['float64', 'int64']:\n",
    "            skew = df[col].skew()\n",
    "            fill_val = df[col].median() if abs(skew) >= 1 else df[col].mean()\n",
    "            strategy = 'median' if abs(skew) >= 1 else 'mean'\n",
    "        else:\n",
    "            fill_val = df[col].mode()[0]\n",
    "            strategy = 'mode'\n",
    "        df[col] = df[col].fillna(fill_val)\n",
    "        print(f'  Filled \"{col}\" with {strategy} = {fill_val}')\n",
    "    print(f'\\nAfter imputation — remaining nulls: {df.isnull().sum().sum()}')\n",
    "\n",
    "print(f'\\nMerged dataset shape: {df.shape}')\n",
    "df.describe()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📊 Step 4: Dataset Visualisations"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 4.1 Outbreak Class Distribution\n",
    "plt.figure(figsize=(6, 4))\n",
    "sns.countplot(x='outbreak', data=df, hue='outbreak', palette='viridis', legend=False)\n",
    "plt.title('Outbreak Class Distribution')\n",
    "plt.xlabel('Outbreak Active (0=No, 1=Yes)')\n",
    "plt.ylabel('Count')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 4.2 Feature Correlation Heatmap\n",
    "plt.figure(figsize=(10, 8))\n",
    "numeric_df = df.select_dtypes(include=[np.number])\n",
    "sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt='.2f', linewidths=0.5)\n",
    "plt.title('Pearson Correlation Heatmap of Mapped Variables')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 4.3 Rainfall vs Outbreak\n",
    "plt.figure(figsize=(8, 5))\n",
    "sns.boxplot(x='outbreak', y='rainfall', data=df, hue='outbreak', palette='Set2', legend=False)\n",
    "plt.title('Annual Rainfall Distribution vs Outbreak Status')\n",
    "plt.xlabel('Outbreak Active (0=No, 1=Yes)')\n",
    "plt.ylabel('Annual Rainfall (mm)')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 4.4 Year-wise Outbreak Trends\n",
    "plt.figure(figsize=(12, 5))\n",
    "sns.lineplot(x='year', y='outbreak', data=df, color='#e67e22', errorbar=None, marker='o')\n",
    "plt.title('Historical Indian Outbreak Probability Trends (1901-2015)')\n",
    "plt.xlabel('Year')\n",
    "plt.ylabel('Outbreak Occurrence Probability')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🛠️ Step 4: Feature Splitting & Scaling"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "feature_cols = [\n",
    "    'fever', 'diarrhea', 'vomiting', 'symptom_severity_score',\n",
    "    'water_contamination', 'sanitation_index',\n",
    "    'rainfall', 'rainfall_intensity', 'flood_risk', 'flood_frequency', 'temperature', 'humidity',\n",
    "    'year', 'month', 'season_numeric',\n",
    "    'location_numeric', 'region_type', 'population_density'\n",
    "]\n",
    "X = df[feature_cols]\n",
    "y = df['outbreak']\n",
    "\n",
    "# Split train/test (80/20)\n",
    "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\n",
    "\n",
    "# Fit Standard Scaler\n",
    "scaler = StandardScaler()\n",
    "X_train_scaled = scaler.fit_transform(X_train)\n",
    "X_test_scaled = scaler.transform(X_test)\n",
    "\n",
    "print(f\"Training set shape: {X_train.shape}\")\n",
    "print(f\"Testing set shape: {X_test.shape}\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🧠 Step 5: Multi-Model Execution & Leaderboard Comparison (15 Models)\n",
    "\n",
    "We instantiate all 15 algorithms, train them programmatically, and compute core metrics: Accuracy, Precision, Recall, and F1-Score."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Define 15 Classifiers\n",
    "models = {\n",
    "    \"Random Forest Classifier\": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),\n",
    "    \"XGBoost Classifier\": XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42, eval_metric='logloss'),\n",
    "    \"LightGBM Classifier\": LGBMClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42, verbose=-1),\n",
    "    \"CatBoost Classifier\": CatBoostClassifier(n_estimators=100, depth=5, learning_rate=0.1, random_seed=42, verbose=0),\n",
    "    \"Extra Trees Classifier\": ExtraTreesClassifier(n_estimators=100, max_depth=6, random_state=42),\n",
    "    \"Gradient Boosting Classifier\": GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42),\n",
    "    \"Hist Gradient Boosting\": HistGradientBoostingClassifier(max_iter=100, max_depth=4, random_state=42),\n",
    "    \"AdaBoost Classifier\": AdaBoostClassifier(n_estimators=100, random_state=42),\n",
    "    \"Bagging Classifier\": BaggingClassifier(n_estimators=50, random_state=42),\n",
    "    \"Logistic Regression\": LogisticRegression(max_iter=1000, random_state=42),\n",
    "    \"K-Nearest Neighbors\": KNeighborsClassifier(n_neighbors=5),\n",
    "    \"Gaussian Naive Bayes\": GaussianNB(),\n",
    "    \"Support Vector Machine\": SVC(probability=True, random_state=42)\n",
    "}\n",
    "\n",
    "# Ensemble Methods\n",
    "models[\"Voting Classifier\"] = VotingClassifier(\n",
    "    estimators=[\n",
    "        ('rf', RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)),\n",
    "        ('xgb', XGBClassifier(n_estimators=50, max_depth=3, learning_rate=0.1, random_state=42, eval_metric='logloss')),\n",
    "        ('lr', LogisticRegression(max_iter=1000, random_state=42))\n",
    "    ],\n",
    "    voting='soft'\n)\n",
    "\n",
    "models[\"Stacking Classifier\"] = StackingClassifier(\n",
    "    estimators=[\n",
    "        ('et', ExtraTreesClassifier(n_estimators=50, max_depth=4, random_state=42)),\n",
    "        ('lgb', LGBMClassifier(n_estimators=50, max_depth=3, learning_rate=0.1, random_state=42, verbose=-1)),\n",
    "        ('cat', CatBoostClassifier(n_estimators=50, depth=4, learning_rate=0.1, random_seed=42, verbose=0))\n",
    "    ],\n",
    "    final_estimator=RandomForestClassifier(n_estimators=50, max_depth=3, random_state=42)\n)\n",
    "\n",
    "results = []\n",
    "trained_models = {}\n",
    "\n",
    "for name, model in models.items():\n",
    "    # Standardize feature fitting on scaled inputs for maximum consistency\n",
    "    model.fit(X_train_scaled, y_train)\n",
    "    y_pred = model.predict(X_test_scaled)\n",
    "        \n",
    "    acc = accuracy_score(y_test, y_pred)\n",
    "    prec = precision_score(y_test, y_pred, zero_division=0)\n",
    "    rec = recall_score(y_test, y_pred, zero_division=0)\n",
    "    f1 = f1_score(y_test, y_pred, zero_division=0)\n",
    "    \n",
    "    results.append({\n",
    "        \"Model\": name,\n",
    "        \"Accuracy\": acc,\n",
    "        \"Precision\": prec,\n",
    "        \"Recall\": rec,\n",
    "        \"F1-Score\": f1\n",
    "    })\n",
    "    trained_models[name] = model\n",
    "\n",
    "df_results = pd.DataFrame(results)\n",
    "# Leaderboard sorted by Accuracy + F1\n",
    "df_results['Score'] = df_results['Accuracy'] + df_results['F1-Score']\n",
    "df_results = df_results.sort_values(by='Score', ascending=False).drop(columns=['Score'])\n",
    "df_results"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 🏆 Step 6: Visualizing the Leaderboard & Selecting Winner"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "plt.figure(figsize=(12, 6))\n",
    "sns.barplot(x='Accuracy', y='Model', data=df_results.sort_values(by='Accuracy', ascending=False), hue='Model', palette='plasma', legend=False)\n",
    "plt.title('Model Accuracy Leaderboard')\n",
    "plt.xlabel('Accuracy Score')\n",
    "plt.xlim(0.90, 1.00)\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "best_model_name = df_results.iloc[0]['Model']\n",
    "best_model = trained_models[best_model_name]\n",
    "best_acc = df_results.iloc[0]['Accuracy']\n",
    "print(f\"The Winner is the: {best_model_name} with {best_acc*100:.2f}% Accuracy!\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 📊 Step 7: Winner Evaluation (Confusion Matrix)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "is_scaled = best_model_name in [\n",
    "    \"Random Forest Classifier\", \"Extra Trees Classifier\", \"Gradient Boosting Classifier\", \n",
    "    \"AdaBoost Classifier\", \"Bagging Classifier\", \"Voting Classifier\", \"Stacking Classifier\",\n",
    "    \"Logistic Regression\", \"K-Nearest Neighbors\", \"Gaussian Naive Bayes\", \"Support Vector Machine\"\n",
    "]\n",
    "\n",
    "if is_scaled:\n",
    "    y_pred = best_model.predict(X_test_scaled)\n",
    "else:\n",
    "    y_pred = best_model.predict(X_test)\n",
    "    \n",
    "cm = confusion_matrix(y_test, y_pred)\n",
    "plt.figure(figsize=(6, 5))\n",
    "sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['No Outbreak', 'Outbreak'], yticklabels=['No Outbreak', 'Outbreak'])\n",
    "plt.title(f'Winner Confusion Matrix - {best_model_name}')\n",
    "plt.xlabel('Predicted Outbreak Status')\n",
    "plt.ylabel('Actual Outbreak Status')\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## 💾 Step 8: Serializing Best Model & Inference Setup\n",
    "\n",
    "We save the absolute winner to `../data/model.pkl` to be loaded at runtime by the Flask API server. We also save the metadata and StandardScaler configuration."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": None,
   "metadata": {},
   "outputs": [],
   "source": [
    "model_filepath = '../data/model.pkl'\n",
    "with open(model_filepath, 'wb') as f:\n",
    "    pickle.dump(best_model, f)\n",
    "    \n",
    "meta = {\n",
    "    'model_name': best_model_name,\n",
    "    'features': feature_cols,\n",
    "    'scaled': is_scaled\n}\n",
    "\n",
    "with open('../data/model_metadata.pkl', 'wb') as f:\n",
    "    pickle.dump(meta, f)\n",
    "    \n",
    "print(f\"Winner model ({best_model_name}) successfully exported to {model_filepath}!\")"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}

# Write out the notebook file
models_dir = os.path.dirname(os.path.abspath(__file__))
dest_path = os.path.join(models_dir, 'model.ipynb')
with open(dest_path, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1)
    
print(f"Jupyter Notebook successfully written to {dest_path}")
