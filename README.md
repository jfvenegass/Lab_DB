# Lab_DB

Para la coenxión a la base datos debe cambiar el nombre del servidor al suyo en el archivo config.py

Para la creación de la Base de Datos y la tabla:

CREATE DATABASE Earthquakes
GO

--DROP TABLE #TEMP 
CREATE TABLE #TEMP (
    Time_ms float,
    Place NVARCHAR(500),
    [Status] NVARCHAR(50),
    Tsunami INT,
    Significance FLOAT,
    Data_Type NVARCHAR(50),
    Magnitude FLOAT,
    [State] NVARCHAR(100),
    Longitude FLOAT,
    Latitude FLOAT,
    Depth FLOAT,
    [Date] DATE
);
GO	

BULK INSERT #TEMP
FROM 'C:\Temporal\Eathquakes_D.csv' -- Ruta donde esta el CSV
WITH (
	FIRSTROW = 2, 
	FIELDTERMINATOR = ',', 
	ROWTERMINATOR = '\n',                               
    TABLOCK	
);
--DELETE Earthquakes_1990_2023

--DROP TABLE Earthquakes_1990_2023
CREATE TABLE Earthquakes_1990_2023 (
	id INT IDENTITY(1,1) PRIMARY KEY,
    Time_ms float,
    Place NVARCHAR(500),
    [Status] NVARCHAR(50),
    Tsunami INT,
    Significance FLOAT,
    Data_Type NVARCHAR(50),
    Magnitude FLOAT,
    [State] NVARCHAR(100),
    Longitude FLOAT,
    Latitude FLOAT,
    Depth FLOAT,
    [Date] DATE
);
GO

INSERT INTO Earthquakes_1990_2023 (Time_ms, Place, [Status], Tsunami, 
			Significance, Data_Type, Magnitude, [State], Longitude, Latitude, Depth, [Date])
SELECT Time_ms, Place, [Status], Tsunami, Significance, Data_Type, Magnitude, [State], 
		Longitude, Latitude, Depth, [Date]
FROM #TEMP
