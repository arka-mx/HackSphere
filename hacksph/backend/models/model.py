import os
import pickle
import numpy as np
from config import Config

# Global variables to cache model, scaler, and metadata
_model = None
_scaler = None
_metadata = None

def load_outbreak_model():
    """
    Loads the pickled best-performing model from Config.MODEL_PATH.
    Also loads model metadata and scaler if they exist.
    """
    global _model, _scaler, _metadata
    if _model is not None:
        return _model
        
    if not os.path.exists(Config.MODEL_PATH):
        print(f"Warning: Model file not found at {Config.MODEL_PATH}. Prediction service will use fallback rules.")
        return None
        
    try:
        # Load main model
        with open(Config.MODEL_PATH, 'rb') as f:
            _model = pickle.load(f)
            
        # Load metadata if exists
        meta_path = os.path.join(Config.DATA_DIR, 'model_metadata.pkl')
        if os.path.exists(meta_path):
            with open(meta_path, 'rb') as f:
                _metadata = pickle.load(f)
                
        # Load scaler if exists
        scaler_path = os.path.join(Config.DATA_DIR, 'scaler.pkl')
        if os.path.exists(scaler_path):
            with open(scaler_path, 'rb') as f:
                _scaler = pickle.load(f)
                
        print("Outbreak prediction ML model, metadata, and scaler loaded successfully.")
    except Exception as e:
        print(f"Error loading outbreak model assets: {e}. Fallback rules will be used.")
        _model = None
        
    return _model

def predict_outbreak(
    fever, diarrhea, vomiting, symptom_severity_score,
    water_contamination, sanitation_index,
    rainfall, rainfall_intensity, flood_risk, flood_frequency, temperature, humidity,
    year, month, season_numeric,
    location_numeric, region_type, population_density
):
    """
    Predicts outbreak (0 or 1) using the best-performing model (Gradient Boosting/XGBoost/LightGBM).
    Automatically aligns all 19 features and applies standard scaling.
    Falls back to a robust heuristic if the model assets fail.
    """
    model = load_outbreak_model()
    
    if model is not None:
        try:
            import pandas as pd
            # Build a named DataFrame — eliminates "feature names" sklearn/lgbm warnings
            feature_cols = [
                'fever', 'diarrhea', 'vomiting', 'symptom_severity_score',
                'water_contamination', 'sanitation_index',
                'rainfall', 'rainfall_intensity', 'flood_risk', 'flood_frequency',
                'temperature', 'humidity',
                'year', 'month', 'season_numeric',
                'location_numeric', 'region_type', 'population_density'
            ]
            features = pd.DataFrame([[
                fever, diarrhea, vomiting, symptom_severity_score,
                water_contamination, sanitation_index,
                rainfall, rainfall_intensity, flood_risk, flood_frequency, temperature, humidity,
                year, month, season_numeric,
                location_numeric, region_type, population_density
            ]], columns=feature_cols)
            
            # Scale features
            if _scaler is not None:
                features_scaled = _scaler.transform(features)
                prediction = model.predict(features_scaled)
            else:
                prediction = model.predict(features)
                
            return int(prediction[0])
        except Exception as e:
            print(f"Prediction error using ML model: {e}. Using fallback prediction...")
            
    # Heuristic Fallback: Outbreak if water is contaminated AND we have diarrhea or other cluster symptoms
    if water_contamination == 1:
        if diarrhea == 1 or (fever == 1 and vomiting == 1):
            return 1
    else:
        if fever == 1 and diarrhea == 1 and vomiting == 1:
            return 1
            
    return 0
