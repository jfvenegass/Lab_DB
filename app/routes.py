from flask import Blueprint, render_template, request, jsonify
from .db import get_db_connection

routes = Blueprint('routes', __name__)

@routes.route('/')
def home():
    return render_template('index.html')

@routes.route('/api/terremotos', methods=['GET'])
def get_terremotos():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    country = request.args.get('country')
    min_magnitude = request.args.get('min-magnitude')
    max_magnitude = request.args.get('max-magnitude')

    connection = get_db_connection()
    cursor = connection.cursor()

    # Consulta SQL base que incluye el campo Time_ms
    query = """
    SELECT Time_ms, Date, Magnitude, Place, Latitude, Longitude
    FROM Earthquakes_1990_2023
    WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL AND Magnitude IS NOT NULL
    """
    params = []

    # Agrega el filtro de fecha si ambos están presentes
    if fecha_inicio and fecha_fin:
        query += " AND Date BETWEEN ? AND ?"
        params.extend([fecha_inicio, fecha_fin])

    # Agrega el filtro de país si está presente
    if country and country != 'all':
        query += " AND State = ?"
        params.append(country)
    
    # Agrega filtros de magnitud solo si tienen valores válidos
    if min_magnitude and min_magnitude != 'null':
        query += " AND Magnitude >= ?"
        params.append(float(min_magnitude))

    if max_magnitude and max_magnitude != 'null':
        query += " AND Magnitude <= ?"
        params.append(float(max_magnitude))

    cursor.execute(query, params)
    results = cursor.fetchall()

    # Estructura de los datos a enviar al frontend
    data = [
        {
            "time_ms": row.Time_ms,
            "date": row.Date,
            "magnitude": row.Magnitude,
            "place": row.Place,
            "latitude": row.Latitude,
            "longitude": row.Longitude
        }
        for row in results
    ]

    cursor.close()
    connection.close()

    return jsonify(data)

@routes.route('/api/estadisticas/magnitud', methods=['GET'])
def get_magnitude_stats():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    min_magnitude = request.args.get('min-magnitude')
    max_magnitude = request.args.get('max-magnitude')
    country = request.args.get('country')

    connection = get_db_connection()
    cursor = connection.cursor()

    # Consulta para obtener estadísticas de magnitud con filtros opcionales
    query = """
    SELECT AVG(Magnitude) as Magnitud_Promedio,
           MAX(Magnitude) as Magnitud_Maxima,
           MIN(Magnitude) as Magnitud_Minima
    FROM Earthquakes_1990_2023
    WHERE Date BETWEEN ? AND ?
    AND Latitude IS NOT NULL
    AND Longitude IS NOT NULL
    """
    params = [fecha_inicio, fecha_fin]

    if min_magnitude:
        query += " AND Magnitude >= ?"
        params.append(min_magnitude)

    if max_magnitude:
        query += " AND Magnitude <= ?"
        params.append(max_magnitude)

    if country and country != 'all':
        query += " AND State = ?"
        params.append(country)

    cursor.execute(query, params)
    result = cursor.fetchone()

    stats = {
        "magnitud_promedio": result.Magnitud_Promedio,
        "magnitud_maxima": result.Magnitud_Maxima,
        "magnitud_minima": result.Magnitud_Minima
    }

    cursor.close()
    connection.close()

    return jsonify(stats)

@routes.route('/api/estados', methods=['GET'])
def get_unique_states():
    connection = get_db_connection()
    cursor = connection.cursor()

    # Consulta para obtener estados/países únicos
    query = "SELECT DISTINCT State FROM Earthquakes_1990_2023 ORDER BY State"
    cursor.execute(query)
    results = cursor.fetchall()

    # Convierte los resultados en una lista de nombres de estados
    states = [row.State for row in results]

    cursor.close()
    connection.close()

    return jsonify(states)
