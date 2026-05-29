from flask import Blueprint, jsonify
from services.report_service import get_all_reports_with_geo

dashboard_bp = Blueprint('dashboard_routes', __name__)

@dashboard_bp.route('/reports', methods=['GET'])
def get_reports():
    """
    Endpoint for fetching all surveillance reports with coordinates and risk scores.
    """
    try:
        reports = get_all_reports_with_geo()
        return jsonify({
            'success': True,
            'count': len(reports),
            'data': reports
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Failed to retrieve reports: {e}"
        }), 500
