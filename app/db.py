import pyodbc
from config import Config

def get_db_connection():
    conn_str = (
        f"DRIVER={{{Config.SQL_SERVER['driver']}}};"
        f"SERVER={Config.SQL_SERVER['server']};"
        f"DATABASE={Config.SQL_SERVER['database']};"
        "Trusted_Connection=yes;"
    )
    return pyodbc.connect(conn_str)
