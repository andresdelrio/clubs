-- Tabla de configuración global
CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(50) PRIMARY KEY,
  valor VARCHAR(255) NOT NULL,
  descripcion TEXT,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto para inscripciones
INSERT INTO configuracion (clave, valor, descripcion)
VALUES ('inscripciones_habilitadas', 'true', 'Controla si las inscripciones están abiertas globalmente')
ON DUPLICATE KEY UPDATE clave = clave;
