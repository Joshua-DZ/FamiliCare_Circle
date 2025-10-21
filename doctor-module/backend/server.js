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
       (nombre, apellidos, especialidad, Cedula_Profesional, telefono, correo, contraseña, Horario_Consulta, Estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

app.listen(3001, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3001');
  console.log('✅ API Login: POST http://localhost:3001/api/login');
  console.log('✅ API Registro: POST http://localhost:3001/api/registrarse');
  console.log('✅ LOGIN CORREGIDO - Usando nombres de campos consistentes ✅');
});