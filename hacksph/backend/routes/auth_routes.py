from flask import Blueprint, request, jsonify
from services.auth_service import verify_firebase_token

auth_bp = Blueprint('auth_routes', __name__)

@auth_bp.route('/login', methods=['POST'])
def google_login():
    """
    Endpoint for Google Login.
    Verifies Firebase ID Token and returns user context and role.
    """
    if not request.is_json:
        return jsonify({
            'success': False,
            'message': 'Request content must be JSON.'
        }), 400
        
    data = request.get_json()
    id_token = data.get('idToken')
    
    if not id_token:
        return jsonify({
            'success': False,
            'message': 'Missing required field: idToken'
        }), 400
        
    user, error = verify_firebase_token(id_token)
    
    if error:
        return jsonify({
            'success': False,
            'message': f"Authentication failed: {error}"
        }), 401
        
    return jsonify({
        'success': True,
        'message': 'Successfully authenticated with Google Login',
        'user': user
    }), 200
