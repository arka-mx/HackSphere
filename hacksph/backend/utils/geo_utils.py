import random
from db import get_db_connection

def get_village_coordinates(village_name):
    """
    Lookup village coordinates in the database.
    If the village does not exist, generate random nearby coordinates
    (centered around Kadamkuan, Bihar: 25.608, 85.158)
    and save them to the database.
    """
    cleaned_name = str(village_name).strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT latitude, longitude FROM villages WHERE LOWER(village) = LOWER(?)", (cleaned_name,))
    row = cursor.fetchone()
    
    if row:
        lat, lng = row['latitude'], row['longitude']
        conn.close()
        return lat, lng
        
    lat_offset = random.uniform(-0.08, 0.08)
    lng_offset = random.uniform(-0.08, 0.08)
    lat = round(25.6100 + lat_offset, 4)
    lng = round(85.1600 + lng_offset, 4)
    
    try:
        cursor.execute("INSERT INTO villages (village, latitude, longitude) VALUES (?, ?, ?)", (cleaned_name, lat, lng))
        conn.commit()
    except Exception as e:
        print(f"Error seeding new village '{cleaned_name}': {e}")
        
    conn.close()
    return lat, lng
