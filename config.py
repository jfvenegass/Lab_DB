import os

class Config:
    SQL_SERVER = {
        'driver': 'ODBC Driver 17 for SQL Server',
        'server': 'JOSEPHVENEGAS',
        'database': 'Earthquakes',
        'trusted_connection': 'yes'  # Indicador de autenticación de Windows
    }
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'clave_secreta'
