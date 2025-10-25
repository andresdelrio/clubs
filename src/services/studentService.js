const fs = require('fs');
const { getPool } = require('../config/database');
const sedeModel = require('../models/sedeModel');
const studentModel = require('../models/studentModel');
const enrollmentModel = require('../models/enrollmentModel');
const { parseCsvFile } = require('../utils/csv');
const { badRequest, notFound, conflict } = require('../utils/errors');

function normalizeSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function importStudentsCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw badRequest('Archivo no encontrado para importar');
  }

  const sedes = await sedeModel.getAllSedes();
  const sedeMap = sedes.reduce((acc, sede) => {
    acc[sede.slug] = sede;
    acc[normalizeSlug(sede.nombre)] = sede;
    return acc;
  }, {});

  const records = await parseCsvFile(filePath, {
    columns: ['sede', 'grupo', 'nombre', 'documento'],
  });

  if (!records.length) {
    return {
      agregados: [],
      duplicados: [],
      errores: ['El archivo no contiene registros'],
    };
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  const agregados = [];
  const duplicados = [];
  const errores = [];
  const vistos = new Set();

  try {
    await connection.beginTransaction();

    for (let index = 0; index < records.length; index += 1) {
      const raw = records[index];
      const linea = index + 1;

      const sedeValor = raw.sede?.trim();
      const grupo = raw.grupo?.trim();
      const nombre = raw.nombre?.trim();
      const documentoValor = raw.documento?.trim();
      const documento = documentoValor ? documentoValor.toUpperCase() : '';

      if (!sedeValor || !grupo || !nombre || !documento) {
        errores.push(`Línea ${linea}: faltan campos obligatorios`);
        continue;
      }

      if (vistos.has(documento)) {
        duplicados.push({ documento, motivo: 'Documento duplicado en archivo' });
        continue;
      }

      const sede = sedeMap[normalizeSlug(sedeValor)];
      if (!sede) {
        errores.push(`Línea ${linea}: sede "${sedeValor}" no válida`);
        continue;
      }

      if (!/^[0-9A-Za-z-]+$/.test(documento)) {
        errores.push(`Línea ${linea}: documento "${documento}" inválido`);
        continue;
      }

      vistos.add(documento);

      try {
        const result = await studentModel.ensureStudent(connection, {
          sedeId: sede.id,
          grupo,
          nombre,
          documento,
        });
        if (result.created) {
          agregados.push({ documento, nombre, sede: sede.slug });
        } else {
          duplicados.push({ documento, motivo: 'Documento ya registrado' });
        }
      } catch (error) {
        errores.push(`Línea ${linea}: Error al guardar (${error.message})`);
      }
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
    fs.unlink(filePath, () => {});
  }

  return { agregados, duplicados, errores };
}

async function getEligibleStudent(documento, sedeId) {
  const student = await studentModel.findStudentByDocument(
    documento ? documento.trim().toUpperCase() : ''
  );
  if (!student) {
    throw notFound('Estudiante no habilitado');
  }
  if (sedeId && student.sedeId !== sedeId) {
    throw conflict('La sede del estudiante no coincide con el club');
  }
  return student;
}

async function ensureStudentAvailableForClub(documento, club) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const student = await studentModel.findStudentByDocument(
      documento ? documento.trim().toUpperCase() : ''
    );
    if (!student) {
      throw notFound('Estudiante no habilitado');
    }
    if (student.sedeId !== club.sedeId) {
      throw conflict('La sede del estudiante no coincide con el club seleccionado');
    }
    const existing = await enrollmentModel.getActiveEnrollmentByStudentId(connection, student.id);
    if (existing) {
      throw conflict('El estudiante ya está inscrito en un club');
    }
    return student;
  } finally {
    connection.release();
  }
}

async function listStudents(filters) {
  return studentModel.getStudents(filters);
}

module.exports = {
  importStudentsCsv,
  getEligibleStudent,
  ensureStudentAvailableForClub,
  listStudents,
};
