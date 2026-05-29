from db import get_db_connection
from utils.validators import validate_report_data
from utils.geo_utils import get_village_coordinates
from services.prediction_service import calculate_hybrid_risk
from services.alert_service import trigger_outbreak_alert

def add_report(raw_data):
    """
    Validate raw data, compute hybrid risk score and ML prediction,
    store in database, and trigger alerts if risk exceeds 80%.
    """
    is_valid, validation_res = validate_report_data(raw_data)
    if not is_valid:
        return False, validation_res
        
    cleaned_data = validation_res
    
    pred_res = calculate_hybrid_risk(
        fever=cleaned_data['fever'],
        diarrhea=cleaned_data['diarrhea'],
        vomiting=cleaned_data['vomiting'],
        water_condition=cleaned_data['water_condition'],
        village=cleaned_data['village'],
        date=cleaned_data['date'],
        symptom_severity_score=cleaned_data.get('symptom_severity_score')
    )
    
    risk_score = pred_res['risk']
    ml_pred = pred_res['ml_prediction']
    water_numeric = pred_res['water_numeric']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        INSERT INTO reports (
            village, fever, diarrhea, vomiting, 
            water_condition, water_numeric, date, 
            risk_score, ml_prediction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            cleaned_data['village'],
            cleaned_data['fever'],
            cleaned_data['diarrhea'],
            cleaned_data['vomiting'],
            cleaned_data['water_condition'],
            water_numeric,
            cleaned_data['date'],
            risk_score,
            ml_pred
        ))
        conn.commit()
        report_id = cursor.lastrowid
    except Exception as e:
        conn.close()
        return False, f"Database error when storing report: {e}"
        
    conn.close()
    
    alert_triggered = trigger_outbreak_alert(cleaned_data['village'], risk_score)
    
    lat, lng = get_village_coordinates(cleaned_data['village'])
    
    response_data = {
        'id': report_id,
        'village': cleaned_data['village'],
        'fever': cleaned_data['fever'],
        'diarrhea': cleaned_data['diarrhea'],
        'vomiting': cleaned_data['vomiting'],
        'water_condition': cleaned_data['water_condition'],
        'water_numeric': water_numeric,
        'date': cleaned_data['date'],
        'risk_score': risk_score,
        'risk_level': pred_res['level'],
        'ml_prediction': ml_pred,
        'latitude': lat,
        'longitude': lng,
        'alert_triggered': alert_triggered
    }
    
    return True, response_data

def add_bulk_reports(reports_list):
    """
    Process multiple reports (e.g. bulk upload from offline local storage sync).
    """
    if not isinstance(reports_list, list):
        return False, "Expected a list of reports."
        
    success_count = 0
    failure_count = 0
    processed_reports = []
    errors = []
    
    for idx, report_data in enumerate(reports_list):
        success, res = add_report(report_data)
        if success:
            success_count += 1
            processed_reports.append(res)
        else:
            failure_count += 1
            errors.append({'index': idx, 'error': res, 'data': report_data})
            
    return True, {
        'processed': success_count,
        'failed': failure_count,
        'reports': processed_reports,
        'errors': errors
    }

def get_all_reports_with_geo():
    """
    Fetch all reports from the database and enrich them with their village coordinates.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM reports ORDER BY date DESC, id DESC')
    rows = cursor.fetchall()
    
    reports = []
    for row in rows:
        village_name = row['village']
        lat, lng = get_village_coordinates(village_name)
        
        score = row['risk_score']
        if score <= 40:
            level = "LOW"
        elif score <= 80:
            level = "MEDIUM"
        else:
            level = "HIGH"
            
        reports.append({
            'id': row['id'],
            'village': village_name,
            'fever': row['fever'],
            'diarrhea': row['diarrhea'],
            'vomiting': row['vomiting'],
            'water_condition': row['water_condition'],
            'water_numeric': row['water_numeric'],
            'date': row['date'],
            'risk_score': score,
            'risk_level': level,
            'ml_prediction': row['ml_prediction'],
            'latitude': lat,
            'longitude': lng
        })
        
    conn.close()
    return reports
