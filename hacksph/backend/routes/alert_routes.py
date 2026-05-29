from flask import Blueprint, jsonify
from services.alert_service import get_active_alerts, resolve_alert

alert_bp = Blueprint('alert_routes', __name__)

@alert_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """
    Endpoint for fetching all active outbreak alerts.
    """
    try:
        alerts = get_active_alerts()
        return jsonify({
            'success': True,
            'count': len(alerts),
            'data': alerts
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Failed to retrieve active alerts: {e}"
        }), 500

@alert_bp.route('/alerts/resolve/<int:alert_id>', methods=['POST'])
def resolve_active_alert(alert_id):
    """
    Endpoint to mark a specific outbreak alert as resolved.
    """
    try:
        success = resolve_alert(alert_id)
        if success:
            return jsonify({
                'success': True,
                'message': f"Alert ID {alert_id} resolved successfully."
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f"Failed to resolve Alert ID {alert_id}."
            }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error: {e}"
        }), 500
