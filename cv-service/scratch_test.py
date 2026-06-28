import sys
import os

# Adjust path to import cv-service modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv(override=True)

print("POSTGRES_URL in env:", os.getenv("POSTGRES_URL"))
print("DATABASE_URL in env:", os.getenv("DATABASE_URL"))

from app.db.queries import db_queries

try:
    print("Attempting to connect and fetch active planograms / cells...")
    # Query database to see what planograms exist
    import psycopg2
    conn = psycopg2.connect(db_queries.db_url)
    with conn.cursor() as cur:
        cur.execute("SELECT id, name FROM planograms")
        planograms = cur.fetchall()
        print("Available Planograms in DB:", planograms)
        
        if planograms:
            plano_id = planograms[0][0]
            print(f"Fetching cells for Planogram ID: {plano_id}...")
            cells = db_queries.fetch_planogram_cells(plano_id)
            print(f"Successfully fetched {len(cells)} cells.")
        else:
            print("No planograms found in DB.")
    conn.close()
except Exception as e:
    print("TEST FAILED WITH EXCEPTION:")
    import traceback
    traceback.print_exc()
