const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
  host: '127.0.0.1', 
  user: 'root',
  password: 'root',
  database: 'familycarecircledb',
  connectionLimit: 5,
  bigIntAsNumber: true
});

// RUTA PARA LOGIN DE DOCTORES - USANDO LOS MISMOS NOMBRES QUE EL VIEJO
app.post('/api/login', async (req, res) => {
  let conn;
  try {
    const { email, password } = req.body;
    
    conn = await pool.getConnection();
    
    // Buscar en la tabla medicos - USAR "Correo" (MAYÚSCULA) como en el viejo
    const medicosRows = await conn.query(
      "SELECT * FROM medicos WHERE Correo = ?",
      [email]
    );

    let user = null;
    let userType = '';

    if (medicosRows.length > 0) {
      user = medicosRows[0];
      userType = 'Medico';
    } else {
      const usuariosRows = await conn.query(
        "SELECT * FROM usuarios WHERE Correo = ?",
        [email]
      );
      
      if (usuariosRows.length > 0) {
        user = usuariosRows[0];
        userType = user.Tipo_Usuario;
      }
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar contraseña - USAR "Contraseña" (MAYÚSCULA) como en el viejo
    if (user.Contraseña !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña incorrecta' 
      });
    }

    // Login exitoso - USAR LOS MISMOS NOMBRES QUE EL VIEJO
    const responseData = {
      success: true,
      user: {
        id: Number(user.ID_Medico || user.ID_Usuario),
        name: `${user.Nombre} ${user.Apellidos}`,  // ← "Nombre" y "Apellidos" con mayúscula
        email: user.Correo,                        // ← "Correo" con mayúscula  
        role: userType,
        specialty: user.Especialidad || 'Paciente' // ← "Especialidad" con mayúscula
      }
    };

    res.json(responseData);

  } catch (err) {
    console.log('Error en login:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  } finally {
    if (conn) conn.release();
  }
});

// RUTA PARA REGISTRO DE MÉDICOS - MANTENER COMO ESTÁ (funciona bien)
app.post('/api/registrarse', async (req, res) => {
  let conn;
  try {
    console.log('📨 Datos recibidos para registro:', req.body);
    
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const especialidad = req.body.especialidad;
    const cedula = req.body.cedula || req.body.Cedula_Profesional;
    const telefono = req.body.telefono;
    const email = req.body.email || req.body.correo;
    const password = req.body.password || req.body.contraseña;
    const horarioConsulta = req.body.horarioConsulta || req.body.Horario_Consulta;

    console.log('🔧 Datos procesados:', {
      nombre, apellidos, especialidad, cedula, telefono, email, password, horarioConsulta
    });

    conn = await pool.getConnection();
    console.log('✅ Conexión a BD establecida');

    // Verificar si ya existe el correo - USAR "correo" (minúscula) como estaba
    const existeCorreo = await conn.query(
      "SELECT * FROM medicos WHERE correo = ?",
      [email]
    );

    console.log('🔍 Resultado de búsqueda de correo:', existeCorreo.length);

    if (existeCorreo.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado.'
      });
    }

    // Verificar si ya existe la cédula profesional
    const existeCedula = await conn.query(
      "SELECT * FROM medicos WHERE Cedula_Profesional = ?",
      [cedula]
    );

    console.log('🔍 Resultado de búsqueda de cédula:', existeCedula.length);

    if (existeCedula.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'La cédula profesional ya está registrada.'
      });
    }

    // Insertar nuevo médico - MANTENER LOS NOMBRES ACTUALES (funciona bien)
    console.log('📝 Insertando nuevo médico...');
    const result = await conn.query(
      `INSERT INTO medicos 
       (nombre, apellidos, especialidad, Cedula_Profesional, telefono, correo, contraseña)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, 
        apellidos, 
        especialidad, 
        cedula, 
        telefono || null, 
        email, 
        password, 
        horarioConsulta || 'Lunes a Viernes 8:00 - 16:00', 
        'Activo'
      ]
    );

    console.log('✅ Médico insertado con ID:', result.insertId);

    const responseData = {
      success: true,
      message: 'Médico registrado correctamente',
      id: Number(result.insertId)
    };

    res.json(responseData);

  } catch (err) {
    console.error('❌ Error al registrar médico:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) {
      conn.release();
      console.log('🔓 Conexión liberada');
    }
  }
});

// RUTA PARA OBTENER MÉDICOS
app.get('/api/medicos', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const medicos = await conn.query("SELECT * FROM medicos");
    
    const medicosConvertidos = medicos.map(medico => ({
      ...medico,
      ID_Medico: Number(medico.ID_Medico)
    }));
    
    res.json({
      success: true,
      medicos: medicosConvertidos
    });
  } catch (err) {
    console.error('Error al obtener médicos:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  } finally {
    if (conn) conn.release();
  }
});

// RUTA PARA VERIFICAR CONEXIÓN
app.get('/api/test-db', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query("SELECT 1 as test");
    
    res.json({
      success: true,
      message: 'Conexión a la base de datos exitosa',
      test: result
    });
  } catch (err) {
    console.error('Error de conexión a BD:', err);
    res.status(500).json({
      success: false,
      message: 'Error de conexión a la base de datos: ' + err.message
    });
  } finally {
    if (conn) conn.release();
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor FamilyCare Circle funcionando',
    endpoints: {
      login: 'POST /api/login',
      register: 'POST /api/registrarse', 
      medicos: 'GET /api/medicos',
      test: 'GET /api/test-db'
    }
  });
});
/*Nuevos metodos de panel medico*/
// RUTA PARA REGISTRO DE PACIENTES/FAMILIARES
app.post('/api/registro-paciente', async (req, res) => {
  let conn;
  try {
    console.log('📨 Datos recibidos para registro de paciente:', req.body);
    
    const { 
      nombre, 
      apellidos, 
      fecha_de_nacimiento, 
      sexo, 
      email, 
      telefono, 
      password, 
      tipo_de_paciente 
    } = req.body;

    console.log('🔧 Datos procesados:', {
      nombre, apellidos, fecha_de_nacimiento, sexo, email, telefono, password, tipo_de_paciente
    });

    conn = await pool.getConnection();
    console.log('✅ Conexión a BD establecida');

    // Verificar si ya existe el correo
    const existeCorreo = await conn.query(
      "SELECT * FROM usuarios WHERE Correo = ?",
      [email]
    );

    console.log('🔍 Resultado de búsqueda de correo:', existeCorreo.length);

    if (existeCorreo.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado.'
      });
    }

    // Insertar nuevo paciente/familiar
    console.log('📝 Insertando nuevo usuario...');
    const result = await conn.query(
      `INSERT INTO usuarios 
       (Nombre, Apellidos, Fecha_Nacimiento, Sexo, Correo, Telefono, Contraseña)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, 
        apellidos, 
        fecha_de_nacimiento, 
        sexo, 
        email, 
        telefono || null, 
        password, 
        tipo_de_paciente
      ]
    );

    console.log('✅ Usuario insertado con ID:', result.insertId);

    const responseData = {
      success: true,
      message: 'Usuario registrado correctamente',
      id: Number(result.insertId)
    };

    res.json(responseData);

  } catch (err) {
    console.error('❌ Error al registrar usuario:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) {
      conn.release();
      console.log('🔓 Conexión liberada');
    }
  }
});
// RUTA PARA REGISTRO DE FAMILIARES
app.post('/api/registro-familiar', async (req, res) => {
  let conn;
  try {
    const { 
      nombre, apellidos, fecha_de_nacimiento, sexo, email, 
      telefono, password, relacion 
    } = req.body;

    conn = await pool.getConnection();

    // Verificar si ya existe el correo
    const existeCorreo = await conn.query(
      "SELECT * FROM familiares WHERE Correo = ?",
      [email]
    );

    if (existeCorreo.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado.'
      });
    }

    // Insertar nuevo familiar
    const result = await conn.query(
      `INSERT INTO familiares 
       (Nombre, Apellidos, Relacion, Telefono, Correo)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellidos, relacion, telefono, email]
    );

    const responseData = {
      success: true,
      message: 'Familiar registrado correctamente',
      id: Number(result.insertId)
    };

    res.json(responseData);

  } catch (err) {
    console.error('Error al registrar familiar:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) conn.release();
  }
});
// RUTA PARA CREAR RECETA (MODIFICADA PARA BUSCAR POR CORREO)
app.post('/api/crear-receta', async (req, res) => {
  let conn;
  try {
    console.log('📨 Datos recibidos para crear receta:', req.body);
    
    const { 
      correo_paciente, // Cambiado de 'paciente' a 'correo_paciente'
      diagnostico,
      instrucciones_especificas,
      fecha_emision,
      fecha_vencimiento,
      via_administracion,
      medicamentos 
    } = req.body;

    // Validar que se proporcionó el correo
    if (!correo_paciente) {
      return res.status(400).json({
        success: false,
        message: 'El correo del paciente es requerido'
      });
    }

    conn = await pool.getConnection();
    
    // ID del médico (por ahora 1 para pruebas)
    const id_medico = 1;
    
    // Buscar el ID del paciente por CORREO (cambiado)
    const pacienteRows = await conn.query(
      "SELECT ID_Usuario FROM usuarios WHERE Correo = ?", // Cambiado a Correo
      [correo_paciente] // Busca por correo en lugar de nombre
    );

    if (pacienteRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Paciente no encontrado con ese correo electrónico'
      });
    }

    const id_paciente = pacienteRows[0].ID_Usuario;

    // Convertir array de medicamentos a string para la base de datos
    const medicamentosTexto = medicamentos.map(med => 
      `${med.nombre} - ${med.dosis} - ${med.frecuencia}`
    ).join('; ');

    // Obtener datos del primer medicamento para los campos individuales
    const primerMedicamento = medicamentos[0];

    // Insertar la receta
    const result = await conn.query(
      `INSERT INTO recetas 
       (ID_Medico, ID_Paciente, Fecha_Emision, Fecha_Vencimiento, Diagnostico, 
        Medicamentos, Dosis, Frecuencia, Horario, Duracion_Dias, 
        Instrucciones_Especificas, Via_Administracion, Estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activa')`,
      [
        id_medico,
        id_paciente,
        fecha_emision,
        fecha_vencimiento,
        diagnostico,
        medicamentosTexto,
        primerMedicamento.dosis,
        primerMedicamento.frecuencia,
        primerMedicamento.horario,
        primerMedicamento.duracion_dias,
        instrucciones_especificas || '',
        via_administracion || null
      ]
    );

    const id_receta = result.insertId;

    // Crear notificaciones para cada medicamento
    for (const medicamento of medicamentos) {
      await conn.query(
        `INSERT INTO notificaciones 
         (ID_Usuario, ID_Receta, Tipo, Mensaje, Fecha_Hora_Programada, Estado)
         VALUES (?, ?, 'Recordatorio de medicamento', ?, ?, 'Pendiente')`,
        [
          id_paciente,
          id_receta,
          `Recordatorio: Tomar ${medicamento.nombre} ${medicamento.dosis} - ${medicamento.frecuencia}`,
          `${fecha_emision} ${medicamento.horario}:00`
        ]
      );
    }

    console.log('✅ Receta creada con ID:', id_receta);

    const responseData = {
      success: true,
      message: 'Receta creada correctamente',
      id_receta: Number(id_receta)
    };

    res.json(responseData);

  } catch (err) {
    console.error('❌ Error al crear receta:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) {
      conn.release();
      console.log('🔓 Conexión liberada');
    }
  }
});
// RUTA PARA BUSCAR PACIENTE PARA HISTORIAL
app.get('/api/buscar-paciente-historial', async (req, res) => {
  let conn;
  try {
    const { correo } = req.query;
    
    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'Correo es requerido'
      });
    }

    conn = await pool.getConnection();
    
    const pacienteRows = await conn.query(
      "SELECT ID_Usuario, Nombre, Apellidos, Fecha_Nacimiento, Sexo, Correo, Telefono FROM usuarios WHERE Correo = ?",
      [correo]
    );

    if (pacienteRows.length === 0) {
      return res.json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      paciente: pacienteRows[0]
    });

  } catch (err) {
    console.error('Error al buscar paciente:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  } finally {
    if (conn) conn.release();
  }
});

// RUTA PARA OBTENER RECETAS DEL PACIENTE
app.get('/api/recetas-paciente', async (req, res) => {
  let conn;
  try {
    const { correo } = req.query;
    
    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'Correo es requerido'
      });
    }

    conn = await pool.getConnection();
    
    // Primero obtener el ID del paciente
    const pacienteRows = await conn.query(
      "SELECT ID_Usuario FROM usuarios WHERE Correo = ?",
      [correo]
    );

    if (pacienteRows.length === 0) {
      return res.json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const id_paciente = pacienteRows[0].ID_Usuario;

    // Obtener recetas del paciente
    const recetasRows = await conn.query(
      `SELECT r.*, m.Nombre as Medico_Nombre, m.Apellidos as Medico_Apellidos 
       FROM recetas r 
       JOIN medicos m ON r.ID_Medico = m.ID_Medico 
       WHERE r.ID_Paciente = ? 
       ORDER BY r.Fecha_Emision DESC`,
      [id_paciente]
    );

    res.json({
      success: true,
      recetas: recetasRows
    });

  } catch (err) {
    console.error('Error al obtener recetas:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  } finally {
    if (conn) conn.release();
  }
});

// RUTA PARA OBTENER ESPECIALIDADES (CORREGIDA)
app.get('/api/especialidades', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Consulta corregida - verificar que la tabla y columna existan
    const especialidadesRows = await conn.query(
      "SELECT DISTINCT Especialidad FROM medicos ORDER BY Especialidad"
    );

    console.log('📋 Especialidades encontradas:', especialidadesRows);

    const especialidades = especialidadesRows.map(row => row.Especialidad);

    res.json({
      success: true,
      especialidades: especialidades
    });

  } catch (err) {
    console.error('❌ Error al obtener especialidades:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) conn.release();
  }
});

// RUTA PARA BUSCAR MÉDICO POR ESPECIALIDAD (CORREGIDA)
app.get('/api/buscar-medico-especialidad', async (req, res) => {
  let conn;
  try {
    const { especialidad } = req.query;
    
    if (!especialidad) {
      return res.status(400).json({
        success: false,
        message: 'Especialidad es requerida'
      });
    }

    conn = await pool.getConnection();
    
    // Buscar médico con la especialidad requerida
    const medicoRows = await conn.query(
      "SELECT ID_Medico, Nombre, Apellidos, Especialidad, Cedula_Profesional FROM medicos WHERE Especialidad = ? LIMIT 1",
      [especialidad]
    );

    console.log('🔍 Buscando médico para especialidad:', especialidad);
    console.log('👨‍⚕️ Médico encontrado:', medicoRows);

    if (medicoRows.length === 0) {
      return res.json({
        success: false,
        message: 'No hay médicos disponibles para esta especialidad'
      });
    }

    res.json({
      success: true,
      medico: medicoRows[0]
    });

  } catch (err) {
    console.error('❌ Error al buscar médico:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) conn.release();
  }
});

// RUTA PARA AGENDAR CITA (CORREGIDA)
app.post('/api/agendar-cita', async (req, res) => {
  let conn;
  try {
    console.log('📨 Datos recibidos para agendar cita:', req.body);
    
    const { 
      correo_paciente,
      paciente_nombre,
      fecha,
      hora,
      tipo,
      motivo,
      notas,
      especialidad,
      ubicacion,
      estado,
      id_medico
    } = req.body;

    // Validar campos obligatorios
    if (!correo_paciente || !fecha || !hora || !id_medico) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios son requeridos'
      });
    }

    conn = await pool.getConnection();
    
    // Verificar que el médico existe
    const medicoRows = await conn.query(
      "SELECT ID_Medico FROM medicos WHERE ID_Medico = ?",
      [id_medico]
    );

    if (medicoRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Médico no encontrado'
      });
    }

    // Buscar el ID del paciente por CORREO
    const pacienteRows = await conn.query(
      "SELECT ID_Usuario FROM usuarios WHERE Correo = ?",
      [correo_paciente]
    );

    if (pacienteRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Paciente no encontrado con ese correo electrónico'
      });
    }

    const id_paciente = pacienteRows[0].ID_Usuario;

    // Insertar la cita en la base de datos
    const result = await conn.query(
      `INSERT INTO citas_medicas 
       (ID_Paciente, ID_Medico, Fecha, Hora, Especialidad, Ubicacion, Motivo, Estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_paciente,
        id_medico,
        fecha,
        hora,
        especialidad,
        ubicacion || 'Consultorio Principal',
        motivo || tipo || 'Consulta programada',
        estado || 'Pendiente'
      ]
    );

    const id_cita = result.insertId;

    console.log('✅ Cita agendada con ID:', id_cita);

    const responseData = {
      success: true,
      message: 'Cita agendada correctamente',
      id_cita: Number(id_cita)
    };

    res.json(responseData);

  } catch (err) {
    console.error('❌ Error al agendar cita:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) {
      conn.release();
      console.log('🔓 Conexión liberada');
    }
  }
});

app.get('/api/citas-medico', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Obtener el ID del médico del query parameter o del token (aquí uso query parameter)
    const { id_medico } = req.query;
    
    if (!id_medico) {
      return res.status(400).json({
        success: false,
        message: 'ID del médico es requerido'
      });
    }

    console.log('🔄 Obteniendo citas para médico ID:', id_medico);
    
    // Obtener todas las citas del médico con información del paciente
    const citasRows = await conn.query(
      `SELECT 
        cm.ID_Cita,
        cm.Fecha,
        cm.Hora,
        cm.Especialidad,
        cm.Motivo,
        cm.Estado,
        cm.Ubicacion,
        u.ID_Usuario,
        u.Nombre as Paciente_Nombre,
        u.Apellidos as Paciente_Apellidos,
        u.Correo as Paciente_Correo,
        u.Telefono as Paciente_Telefono
       FROM citas_medicas cm
       JOIN usuarios u ON cm.ID_Paciente = u.ID_Usuario
       WHERE cm.ID_Medico = ?
       ORDER BY cm.Fecha DESC, cm.Hora DESC`,
      [id_medico]
    );

    console.log('📋 Citas encontradas:', citasRows.length);

    // Convertir IDs a números
    const citasConvertidas = citasRows.map(cita => ({
      ...cita,
      ID_Cita: Number(cita.ID_Cita),
      ID_Usuario: Number(cita.ID_Usuario)
    }));

    res.json({
      success: true,
      citas: citasConvertidas
    });

  } catch (err) {
    console.error('❌ Error al obtener citas del médico:', err);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + err.message
    });
  } finally {
    if (conn) conn.release();
  }
});
app.listen(3001, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3001');
  console.log('✅ API Login: POST http://localhost:3001/api/login');
  console.log('✅ API Registro: POST http://localhost:3001/api/registrarse');
  console.log('✅ LOGIN CORREGIDO - Usando nombres de campos consistentes ✅');
});