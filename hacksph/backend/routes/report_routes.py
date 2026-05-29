from flask import Blueprint, request, jsonify
from services.report_service import add_report, add_bulk_reports

report_bp = Blueprint('report_routes', __name__)

@report_bp.route('/report', methods=['POST'])
def submit_report():
    """
    Endpoint for submitting a single health report.
    Accepts report data, validates, predict risk, and stores it.
    """
    if not request.is_json:
        return jsonify({
            'success': False,
            'message': 'Request content type must be application/json'
        }), 400
        
    raw_data = request.get_json()
    success, res = add_report(raw_data)
    
    if success:
        return jsonify({
            'success': True,
            'message': 'Report processed successfully',
            'data': res
        }), 201
    else:
        return jsonify({
            'success': False,
            'message': res
        }), 400

@report_bp.route('/bulk-upload', methods=['POST'])
def bulk_upload():
    """
    Endpoint for bulk-uploading queued offline health reports.
    """
    if not request.is_json:
        return jsonify({
            'success': False,
            'message': 'Request content type must be application/json'
        }), 400
        
    req_data = request.get_json()
    
    reports_list = req_data.get('reports') if isinstance(req_data, dict) else req_data
    
    if not isinstance(reports_list, list):
        return jsonify({
            'success': False,
            'message': 'Expected a JSON array of reports.'
        }), 400
        
    success, res = add_bulk_reports(reports_list)
    
    if success:
        return jsonify({
            'success': True,
            'message': 'Bulk upload processed',
            'summary': res
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': res
        }), 400
