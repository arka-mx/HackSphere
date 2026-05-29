import os
import pickle
import numpy as np
from config import Config

# Global variable to cache the loaded model
_model = None

def load_outbreak_model():
    """
    Loads the pickled RandomForest model from Config.MODEL_PATH.
    Caches it in the global _model variable.
    """
    global _model
    if _model is not None:
        return _model
        
    if not os.path.exists(Config.MODEL_PATH):
        print(f"Warning: Model file not found at {Config.MODEL_PATH}. Prediction service will use fallback rules.")
        return None
        
    try:
        with open(Config.MODEL_PATH, 'rb') as f:
            _model = pickle.load(f)
        print("Outbreak prediction ML model loaded successfully.")
    except Exception as e:
        print(f"Error loading outbreak model: {e}. Fallback rules will be used.")
        _model = None
        
    return _model

def predict_outbreak(fever, diarrhea, vomiting, water_numeric):
    """
    Predicts outbreak (0 or 1) using the RandomForest model.
    If the model is not loaded, uses a fallback logistic decision rule.
    
    Inputs:
        fever (int: 0/1)
        diarrhea (int: 0/1)
        vomiting (int: 0/1)
        water_numeric (int: 0/1)
        
    Returns:
        int: 0 (no outbreak) or 1 (outbreak)
    """
    model = load_outbreak_model()
    
    if model is not None:
        try:
            # Features input array: shape (1, 4)
            features = np.array([[fever, diarrhea, vomiting, water_numeric]])
            prediction = model.predict(features)
            return int(prediction[0])
        except Exception as e:
            print(f"Prediction error using ML model: {e}. Using fallback prediction...")
            
    # Fallback heuristic: Outbreak if water is contaminated AND we have diarrhea or any 2 other symptoms
    if water_numeric == 1:
        if diarrhea == 1 or (fever == 1 and vomiting == 1):
            return 1
    else:
        if fever == 1 and diarrhea == 1 and vomiting == 1:
            return 1
            
    return 0
