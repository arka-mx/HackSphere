from datetime import datetime

def validate_report_data(data):
    """
    Validate incoming report payload and normalize symptoms to 0 or 1.
    """
    if not data or not isinstance(data, dict):
        return False, "Invalid payload format. Expected JSON object."
        
    # Standardize alternative field names (JalRakshak integration layer)
    if 'location' in data and 'village' not in data:
        data['village'] = data['location']
    if 'water_contamination' in data and 'water_condition' not in data:
        data['water_condition'] = data['water_contamination']
    if 'symptom_severity_score' not in data and 'symptomSeverityScore' in data:
        data['symptom_severity_score'] = data['symptomSeverityScore']
    if 'symptom_severity_score' not in data:
        try:
            f = float(data.get('fever', 0))
            d = float(data.get('diarrhea', 0))
            v = float(data.get('vomiting', 0))
            data['symptom_severity_score'] = int(f + d + v) if (f + d + v) > 0 else 3
        except (ValueError, TypeError):
            data['symptom_severity_score'] = 3

    required_fields = ['village', 'fever', 'diarrhea', 'vomiting', 'water_condition', 'symptom_severity_score']
    for field in required_fields:
        if field not in data or data[field] is None:
            return False, f"Missing required field: '{field}'"
            
    # Validate numeric fields
    try:
        float(data['fever'])
        float(data['diarrhea'])
        float(data['vomiting'])
        float(data['symptom_severity_score'])
    except (ValueError, TypeError):
        return False, "Symptom fever, diarrhea, vomiting, and severity fields must be valid numeric values."

    village = str(data['village']).strip()
    if not village:
        return False, "Village name cannot be empty."
        
    water_condition = str(data['water_condition']).strip()
    if not water_condition:
        return False, "Water condition description cannot be empty."
        
    def to_binary(val, name):
        if isinstance(val, bool):
            return 1 if val else 0
        if isinstance(val, int):
            if val in [0, 1]:
                return val
            return 1 if val > 0 else 0
        if isinstance(val, float):
            return 1 if val > 0.0 else 0
        if isinstance(val, str):
            v_lower = val.strip().lower()
            if v_lower in ['yes', 'true', '1', 'positive', 'y']:
                return 1
            if v_lower in ['no', 'false', '0', 'negative', 'n']:
                return 0
        return None

    fever = to_binary(data['fever'], 'fever')
    diarrhea = to_binary(data['diarrhea'], 'diarrhea')
    vomiting = to_binary(data['vomiting'], 'vomiting')
    
    if fever is None:
        return False, "Invalid value for 'fever'. Must be boolean, integer (0 or 1), or yes/no string."
    if diarrhea is None:
        return False, "Invalid value for 'diarrhea'. Must be boolean, integer (0 or 1), or yes/no string."
    if vomiting is None:
        return False, "Invalid value for 'vomiting'. Must be boolean, integer (0 or 1), or yes/no string."
        
    date_val = data.get('date')
    if date_val:
        date_str = str(date_val).strip()
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            try:
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                date_str = dt.strftime('%Y-%m-%d')
            except ValueError:
                date_str = datetime.now().strftime('%Y-%m-%d')
    else:
        date_str = datetime.now().strftime('%Y-%m-%d')
        
    cleaned_data = {
        'village': village,
        'fever': fever,
        'diarrhea': diarrhea,
        'vomiting': vomiting,
        'water_condition': water_condition,
        'date': date_str,
        'symptom_severity_score': int(float(data['symptom_severity_score']))
    }
    
    return True, cleaned_data
