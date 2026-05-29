from models.model import predict_outbreak
from utils.preprocess import clean_water_condition

def calculate_hybrid_risk(fever, diarrhea, vomiting, water_condition, village=None, date=None):
    """
    Calculates hybrid risk score using the best-performing ML model and rule-based logic.
    Enriches the input with location and environmental attributes dynamically.
    
    Pipeline:
    1. Feature Extraction: Input -> all 19 engineered features
    2. Data Cleaning: Convert 'water_condition' to water_numeric (1 if contaminated, else 0)
    3. Location/Rainfall mapping: Maps rural villages to numerical index, average rainfall, and flood frequency.
    4. ML Prediction: Predict outbreak (0 or 1) using the 19-feature Gradient Boosting model
    5. Rule-Based Risk:
       symptom_risk = fever * 20 + diarrhea * 30 + vomiting * 20
       water_risk = 20 if water contaminated else 0
    6. Hybrid Integration: If ML predicts outbreak, add +30 to risk
    7. Normalization: Cap at 100, floor at 0
    
    Returns:
        dict: {
            "risk": 0-100 integer,
            "level": "LOW" | "MEDIUM" | "HIGH",
            "ml_prediction": 0 or 1,
            "water_numeric": 0 or 1
        }
    """
    water_numeric = clean_water_condition(water_condition)
    
    # 1. Contextual feature engineering from village and date
    year = 2026
    month = 7  # Default to Monsoon (July)
    if date:
        try:
            # Date format usually 'YYYY-MM-DD'
            parts = date.split('-')
            year = int(parts[0])
            month = int(parts[1])
        except Exception:
            pass
            
    # Map preseeded villages to their numerical index, typical annual rainfall, flood risk base, flood frequency, region type, and population density
    village_mappings = {
        'sonpur': {'index': 10, 'rainfall': 1300.0, 'flood_risk_base': 0, 'flood_frequency': 0.12, 'region_type': 1, 'population_density': 1},
        'bishnupur': {'index': 15, 'rainfall': 1750.0, 'flood_risk_base': 1, 'flood_frequency': 0.28, 'region_type': 1, 'population_density': 0},
        'rampur': {'index': 20, 'rainfall': 1100.0, 'flood_risk_base': 0, 'flood_frequency': 0.08, 'region_type': 1, 'population_density': 2},
        'gopalpur': {'index': 25, 'rainfall': 1400.0, 'flood_risk_base': 0, 'flood_frequency': 0.15, 'region_type': 1, 'population_density': 1},
        'chandpur': {'index': 30, 'rainfall': 1250.0, 'flood_risk_base': 0, 'flood_frequency': 0.10, 'region_type': 1, 'population_density': 1},
        'madhupur': {'index': 35, 'rainfall': 1600.0, 'flood_risk_base': 1, 'flood_frequency': 0.24, 'region_type': 1, 'population_density': 0},
        'kasipur': {'index': 5, 'rainfall': 1950.0, 'flood_risk_base': 1, 'flood_frequency': 0.32, 'region_type': 1, 'population_density': 1}
    }
    
    village_key = str(village).strip().lower() if village else 'sonpur'
    mapping = village_mappings.get(village_key, {'index': 10, 'rainfall': 1200.0, 'flood_risk_base': 0, 'flood_frequency': 0.12, 'region_type': 1, 'population_density': 1})
    
    location_numeric = mapping['index']
    rainfall = mapping['rainfall']
    flood_frequency = mapping['flood_frequency']
    region_type = mapping['region_type']
    population_density = mapping['population_density']
    
    # Estimate dynamic flood risk based on village profile and water contamination
    flood_risk = 1 if (mapping['flood_risk_base'] == 1 and water_numeric == 1) else 0
    
    # Season numeric
    if month in [6, 7, 8, 9]:
        season_numeric = 1  # Monsoon
    elif month in [10, 11, 12, 1]:
        season_numeric = 2  # Winter
    else:
        season_numeric = 0  # Summer

    # Rainfall intensity
    if rainfall < 1000:
        rain_intensity = 0  # Low
    elif rainfall < 2000:
        rain_intensity = 1  # Medium
    else:
        rain_intensity = 2  # High
        
    # Temperature and Humidity
    if season_numeric == 1:
        temperature = 28.0
        humidity = 88.0
    elif season_numeric == 0:
        temperature = 35.0
        humidity = 55.0
    else:
        temperature = 21.0
        humidity = 65.0
        
    symptom_severity_score = fever + diarrhea + vomiting
    
    # ML Prediction using the advanced 19-feature model
    ml_pred = predict_outbreak(
        fever=fever,
        diarrhea=diarrhea,
        vomiting=vomiting,
        symptom_severity_score=symptom_severity_score,
        water_contamination=water_numeric,
        sanitation_index=0.22 if flood_risk == 1 else (0.35 if rain_intensity == 2 else 0.70),
        rainfall=rainfall,
        rainfall_intensity=rain_intensity,
        flood_risk=flood_risk,
        flood_frequency=flood_frequency,
        temperature=temperature,
        humidity=humidity,
        year=year,
        month=month,
        season_numeric=season_numeric,
        location_numeric=location_numeric,
        region_type=region_type,
        population_density=population_density
    )
    
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
