import sqlite3
import os
import sys

# Add parent directory to path so we can import config and db
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db import get_db_connection
from config import Config

def init_database():
    print("Initializing database...")
    
    # Ensure database directory exists
    db_dir = os.path.dirname(Config.DATABASE_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('asha', 'admin'))
    )
    ''')
    
    # 2. Create reports table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        village TEXT NOT NULL,
        fever INTEGER NOT NULL CHECK(fever IN (0, 1)),
        diarrhea INTEGER NOT NULL CHECK(diarrhea IN (0, 1)),
        vomiting INTEGER NOT NULL CHECK(vomiting IN (0, 1)),
        water_condition TEXT NOT NULL,
        water_numeric INTEGER NOT NULL CHECK(water_numeric IN (0, 1)),
        date TEXT NOT NULL,
        risk_score REAL NOT NULL,
        ml_prediction INTEGER NOT NULL CHECK(ml_prediction IN (0, 1))
    )
    ''')
    
    # 3. Create villages table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS villages (
        village TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
    )
    ''')
    
    # 4. Create alerts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        village TEXT NOT NULL,
        risk REAL NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'resolved'))
    )
    ''')
    
    conn.commit()
    print("Tables created successfully.")
    
    # Seed default villages
    default_villages = [
        ("Sonpur", 25.6980, 85.1670),
        ("Ramnagar", 25.6420, 85.2050),
        ("Bishnupur", 25.5920, 85.1200),
        ("Hariharpur", 25.6150, 85.2400),
        ("Kadamkuan", 25.6080, 85.1580),
        ("Gopalpur", 25.5700, 85.1800),
        ("Chandpur", 25.6600, 85.1050)
    ]
    
    for name, lat, lng in default_villages:
        cursor.execute('''
        INSERT OR REPLACE INTO villages (village, latitude, longitude)
        VALUES (?, ?, ?)
        ''', (name, lat, lng))
        
    # Seed default users
    default_users = [
        ("Asha Devi", "asha"),
        ("Dr. Arjun Prasad", "admin")
    ]
    
    # Only seed users if the table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        for name, role in default_users:
            cursor.execute('''
            INSERT INTO users (name, role)
            VALUES (?, ?)
            ''', (name, role))
            
    conn.commit()
    conn.close()
    print("Database seeding completed.")

if __name__ == '__main__':
    init_database()
