import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # Database
    DB_DIR = os.path.join(BASE_DIR, 'db_store')
    DATABASE_PATH = os.path.join(DB_DIR, 'database.db')
    
    # ML model & dataset
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    MODEL_PATH = os.path.join(DATA_DIR, 'model.pkl')
    DATASET_PATH = os.path.join(DATA_DIR, 'dataset.csv')
    
    # Firebase Service Account Path (fallback)
    FIREBASE_CREDENTIALS_PATH = os.path.join(
        BASE_DIR, 
        os.environ.get('FIREBASE_CREDENTIALS_PATH', 'db_store/firebase_credentials.json')
    )
    
    # Firebase Service Account Credentials from Env
    FIREBASE_TYPE = os.environ.get('FIREBASE_TYPE')
    FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID')
    FIREBASE_PRIVATE_KEY_ID = os.environ.get('FIREBASE_PRIVATE_KEY_ID')
    FIREBASE_PRIVATE_KEY = os.environ.get('FIREBASE_PRIVATE_KEY')
    FIREBASE_CLIENT_EMAIL = os.environ.get('FIREBASE_CLIENT_EMAIL')
    FIREBASE_CLIENT_ID = os.environ.get('FIREBASE_CLIENT_ID')
    FIREBASE_AUTH_URI = os.environ.get('FIREBASE_AUTH_URI')
    FIREBASE_TOKEN_URI = os.environ.get('FIREBASE_TOKEN_URI')
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL = os.environ.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL')
    FIREBASE_CLIENT_X509_CERT_URL = os.environ.get('FIREBASE_CLIENT_X509_CERT_URL')
    FIREBASE_UNIVERSE_DOMAIN = os.environ.get('FIREBASE_UNIVERSE_DOMAIN')
    
    # App configs
    SECRET_KEY = os.environ.get('SECRET_KEY', 'jalrakshak_secret_key_2026')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    PORT = int(os.environ.get('FLASK_PORT', 5000))
