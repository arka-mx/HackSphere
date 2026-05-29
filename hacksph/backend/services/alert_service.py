from datetime import datetime
from db import get_db_connection

def trigger_outbreak_alert(village, risk):
    """
    Check if the risk score warrants triggering an alert (risk > 80).
    If it does, log the alert to the database unless there is already
    an active alert for this village.
    """
    if risk <= 80:
        return False
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT id FROM alerts 
    WHERE LOWER(village) = LOWER(?) AND status = 'active'
    ''', (village,))
    existing_alert = cursor.fetchone()
    
    if existing_alert:
        conn.close()
        return True
        
    timestamp = datetime.now().isoformat()
    cursor.execute('''
    INSERT INTO alerts (village, risk, timestamp, status)
    VALUES (?, ?, ?, 'active')
    ''', (village, risk, timestamp))
    
    conn.commit()
    conn.close()
    print(f"[ALERT] OUTBREAK ALERT TRIGGERED: {village}, Risk: {risk}%")
    return True

def get_active_alerts():
    """
    Fetch all active alerts from the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE status = 'active' ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    
    alerts = []
    for row in rows:
        alerts.append({
            'id': row['id'],
            'village': row['village'],
            'risk': row['risk'],
            'timestamp': row['timestamp'],
            'status': row['status']
        })
        
    conn.close()
    return alerts

def resolve_alert(alert_id):
    """
    Resolve an active alert.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET status = 'resolved' WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return True
