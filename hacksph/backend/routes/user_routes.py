from flask import Blueprint, jsonify
from db import get_db_connection

user_bp = Blueprint('user_routes', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    """
    Endpoint for fetching all seeded users (ASHA workers and admins).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, name, role FROM users")
        rows = cursor.fetchall()
        
        users = []
        for row in rows:
            users.append({
                'id': row['id'],
                'name': row['name'],
                'role': row['role']
            })
            
        return jsonify({
            'success': True,
            'count': len(users),
            'data': users
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Failed to retrieve users: {e}"
        }), 500
    finally:
        conn.close()
