from flask import Flask
from .routes import routes  # Importa el Blueprint de routes.py
import os

def create_app():
    app = Flask(
        __name__,
        template_folder='../templates',
        static_folder='../static'  # Especifica la carpeta estática
    )
    app.register_blueprint(routes)  # Registra el Blueprint en la app
    return app
