import firebase_admin
from firebase_admin import credentials, auth
from config import Config
import os

_firebase_initialized = False

def init_firebase():
    """
    Initialize the Firebase Admin SDK using the environment variables or falling back
    to the service account credentials JSON file path.
    """
    global _firebase_initialized
    if _firebase_initialized:
        return True
        
    # Try to load directly from environment variables (most secure, avoids credentials file)
    firebase_type = Config.FIREBASE_TYPE
    project_id = Config.FIREBASE_PROJECT_ID
    private_key = Config.FIREBASE_PRIVATE_KEY
    client_email = Config.FIREBASE_CLIENT_EMAIL
    
    if firebase_type and project_id and private_key and client_email:
        try:
            # Reconstruct credentials dictionary from environment variables
            # Convert literal "\n" strings from .env back to actual newlines
            pk_formatted = private_key.replace("\\n", "\n") if private_key else None
            cred_dict = {
                "type": firebase_type,
                "project_id": project_id,
                "private_key_id": Config.FIREBASE_PRIVATE_KEY_ID,
                "private_key": pk_formatted,
                "client_email": client_email,
                "client_id": Config.FIREBASE_CLIENT_ID,
                "auth_uri": Config.FIREBASE_AUTH_URI or "https://accounts.google.com/o/oauth2/auth",
                "token_uri": Config.FIREBASE_TOKEN_URI or "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": Config.FIREBASE_AUTH_PROVIDER_X509_CERT_URL or "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": Config.FIREBASE_CLIENT_X509_CERT_URL,
                "universe_domain": Config.FIREBASE_UNIVERSE_DOMAIN or "googleapis.com"
            }
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            print("Firebase Admin SDK initialized successfully via environment variables.")
            return True
        except Exception as e:
            print(f"Error initializing Firebase Admin SDK from environment variables: {e}")
            
    # Fallback to local service account credentials file
    cred_path = Config.FIREBASE_CREDENTIALS_PATH
    if not os.path.exists(cred_path):
        print(f"Warning: Firebase credentials file not found at {cred_path}. Firebase auth will be offline.")
        return False
        
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        print("Firebase Admin SDK initialized successfully via credentials file.")
        return True
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK via credentials file: {e}")
        return False

def verify_firebase_token(id_token):
    """
    Verify a Firebase ID Token sent from the frontend Google Login flow.
    Registers the user locally if they do not exist.
    """
    init_firebase()
    if not _firebase_initialized:
        return None, "Firebase Admin SDK is not initialized."
        
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        name = decoded_token.get('name', 'Google User')
        
        # Check or register user in SQLite users table
        from db import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Lookup user by name or email
        cursor.execute("SELECT id, role FROM users WHERE LOWER(name) = LOWER(?)", (name,))
        row = cursor.fetchone()
        
        if row:
            role = row['role']
            user_id = row['id']
        else:
            # Default new Google sign-in users to ASHA reporter role
            role = 'asha'
            cursor.execute("INSERT INTO users (name, role) VALUES (?, ?)", (name, role))
            conn.commit()
            user_id = cursor.lastrowid
            
        conn.close()
        
        return {
            'user_id': user_id,
            'uid': uid,
            'name': name,
            'email': email,
            'role': role
        }, None
        
    except Exception as e:
        return None, str(e)
