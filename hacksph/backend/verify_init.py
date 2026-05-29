from config import Config
from services.auth_service import init_firebase
import os

print("Testing Firebase initialization...")
print("FIREBASE_PROJECT_ID:", Config.FIREBASE_PROJECT_ID)
print("FIREBASE_CLIENT_EMAIL:", Config.FIREBASE_CLIENT_EMAIL)

key = Config.FIREBASE_PRIVATE_KEY
if key:
    print("Private key length:", len(key))
    print("First 50 chars:", key[:50])
    print("Last 50 chars:", key[-50:])
    pk_formatted = key.replace("\\n", "\n")
    print("Formatted private key length:", len(pk_formatted))
    
    # Try to initialize
    success = init_firebase()
    print("Init Firebase success:", success)
else:
    print("FIREBASE_PRIVATE_KEY is missing!")
