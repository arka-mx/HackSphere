import os
import sys
import numpy as np
import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report

# Add parent directory to path so we can import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import Config

def generate_synthetic_dataset(num_samples=2500, random_seed=42):
    """
    Generates a realistic synthetic dataset representing waterborne disease outbreaks
    based on symptom records and water contamination status.
    
    Features:
    - fever (0 or 1)
    - diarrhea (0 or 1)
    - vomiting (0 or 1)
    - water_numeric (0 or 1) - 1 means contaminated
    
    Target:
    - outbreak (0 or 1)
    """
    np.random.seed(random_seed)
    
    # Generate random binary features
    fever = np.random.choice([0, 1], size=num_samples, p=[0.7, 0.3])
    diarrhea = np.random.choice([0, 1], size=num_samples, p=[0.75, 0.25])
    vomiting = np.random.choice([0, 1], size=num_samples, p=[0.8, 0.20])
    water_numeric = np.random.choice([0, 1], size=num_samples, p=[0.6, 0.4])
    
    # Target outbreak logic (disease transmission pattern)
    outbreak = []
    for f, d, v, w in zip(fever, diarrhea, vomiting, water_numeric):
        prob = 0.05  # Base probability of other background diseases
        
        # Water contamination is a major driver
        if w == 1:
            prob += 0.20
            if d == 1:  # Cholera/Typhoid symptom with dirty water is extremely high risk
                prob += 0.40
            if v == 1:
                prob += 0.15
            if f == 1:
                prob += 0.10
        else:
            # Clean water, but multiple symptoms could still indicate an outbreak
            if d == 1 and v == 1:
                prob += 0.30
            if f == 1 and d == 1:
                prob += 0.20
                
        prob = min(max(prob, 0.02), 0.95)
        label = np.random.binomial(1, prob)
        outbreak.append(label)
        
    df = pd.DataFrame({
        'fever': fever,
        'diarrhea': diarrhea,
        'vomiting': vomiting,
        'water_numeric': water_numeric,
        'outbreak': outbreak
    })
    
    return df

def train_outbreak_model():
    print("Starting ML Model Training Pipeline (XGBoost & RandomForest)...")
    
    # Ensure data directory exists
    os.makedirs(Config.DATA_DIR, exist_ok=True)
    
    # Generate and save dataset
    df = generate_synthetic_dataset(num_samples=2500)
    df.to_csv(Config.DATASET_PATH, index=False)
    print(f"Dataset generated and saved to {Config.DATASET_PATH} with {len(df)} records.")
    
    # Features and labels
    X = df[['fever', 'diarrhea', 'vomiting', 'water_numeric']]
    y = df['outbreak']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 1. Train RandomForest Baseline
    print("Training RandomForest baseline...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    print(f"RandomForest Accuracy: {accuracy_score(y_test, rf_pred) * 100:.2f}%")
    
    # 2. Train XGBoost early warning model
    print("Training XGBoost early warning model...")
    xgb = XGBClassifier(
        n_estimators=100, 
        max_depth=3, 
        learning_rate=0.1, 
        random_state=42, 
        eval_metric='logloss'
    )
    xgb.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = xgb.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"XGBoost Model trained successfully. Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report (XGBoost):")
    print(classification_report(y_test, y_pred))
    
    # Feature importances
    importances = xgb.feature_importances_
    features = X.columns
    print("\nFeature Importances (XGBoost):")
    for feat, imp in zip(features, importances):
        print(f" - {feat}: {imp:.4f}")
        
    # Save best model (XGBoost) as pickle
    with open(Config.MODEL_PATH, 'wb') as f:
        pickle.dump(xgb, f)
    print(f"Primary early warning model (XGBoost) exported as a pickle file to {Config.MODEL_PATH}")

if __name__ == '__main__':
    train_outbreak_model()
