import sys
import os

# Add the backend directory to python path for robust module imports
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from db_store.init_db import init_database
from models.model import load_outbreak_model

# Import blueprints
from routes.report_routes import report_bp
from routes.dashboard_routes import dashboard_bp
from routes.alert_routes import alert_bp
from routes.user_routes import user_bp
from routes.auth_routes import auth_bp

def create_app():
    """
    Application factory for the JalRakshak Health AI Flask API.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable Cross-Origin Resource Sharing (CORS)
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Initialize SQLite database and seed initial village coordinates
    try:
        init_database()
    except Exception as e:
        app.logger.error(f"Error initializing SQLite database: {e}")
        
    # Load ML prediction model
    try:
        load_outbreak_model()
    except Exception as e:
        app.logger.error(f"Error loading ML model at startup: {e}")
        
    # Register blueprints for routing
    app.register_blueprint(report_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(alert_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    # Standard health-check route
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'project': 'JalRakshak Health AI Backend',
            'version': '1.0.0'
        }), 200
        
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Endpoint not found'}), 404
        
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500
        
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
