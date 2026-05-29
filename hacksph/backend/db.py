import sqlite3
import os
from config import Config

def get_db_connection():
    """
    Establish a connection to the SQLite database.
    Ensures the parent directory for the database exists.
    """
    db_dir = os.path.dirname(Config.DATABASE_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn
