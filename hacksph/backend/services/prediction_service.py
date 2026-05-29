from models.model import predict_outbreak
from utils.preprocess import clean_water_condition

def calculate_hybrid_risk(fever, diarrhea, vomiting, water_condition):
    """
    Calculates hybrid risk score using XGBoost ML model and rule-based logic.
    
    Pipeline:
    1. Feature Extraction: Input -> [fever, diarrhea, vomiting, water_numeric]
    2. Data Cleaning: Convert 'water_condition' to water_numeric (1 if contaminated, else 0)
    3. ML Prediction: Predict outbreak (0 or 1) using XGBoost model
    4. Rule-Based Risk:
       symptom_risk = fever * 20 + diarrhea * 30 + vomiting * 20
       water_risk = 20 if water contaminated else 0
    5. Hybrid Integration: If ML predicts outbreak, add +30 to risk
    6. Normalization: Cap at 100, floor at 0
    
    Returns:
        dict: {
            "risk": 0-100 integer,
            "level": "LOW" | "MEDIUM" | "HIGH",
            "ml_prediction": 0 or 1,
            "water_numeric": 0 or 1
        }
    """
    water_numeric = clean_water_condition(water_condition)
    
    ml_pred = predict_outbreak(fever, diarrhea, vomiting, water_numeric)
    
    symptom_risk = (fever * 20) + (diarrhea * 30) + (vomiting * 20)
    water_risk = 20 if water_numeric == 1 else 0
    raw_risk = symptom_risk + water_risk
    
    if ml_pred == 1:
        raw_risk += 30
        
    risk_score = min(max(raw_risk, 0), 100)
    
    if risk_score <= 40:
        level = "LOW"
    elif risk_score <= 80:
        level = "MEDIUM"
    else:
        level = "HIGH"
        
    return {
        "risk": int(risk_score),
        "level": level,
        "ml_prediction": ml_pred,
        "water_numeric": water_numeric
    }
