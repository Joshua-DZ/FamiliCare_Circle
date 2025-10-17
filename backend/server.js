/*const express = require('express');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
  host: '127.0.0.1', 
  user: 'root',
  password: 'root',
  database: 'Family',
  connectionLimit: 5
});

// RUTA PARA LOGIN DE DOCTORES
app.post('/api/login', async (req, res) => {
  let conn;
  try {
    const { email, password } = req.body;
    
    conn = await pool.getConnection();
    
    // Buscar usuario médico (Tipo_Usuario = 'Pedro')
    const rows = await conn.query(
      "SELECT * FROM usuarios WHERE Correo = ? AND Tipo_Usuario = 'Pedro'",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales incorrectas o no eres médico autorizado' 
      });
    }

    const user = rows[0];
    
    // Verificar contraseña (campo Codeteads)
    if (user.Codeteads !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña incorrecta' 
      });
    }

    // Login exitoso
    res.json({
      success: true,
      user: {
        id: user.ID_Usuario,
        name: ${user.Nombres} ${user.Apellidos},
        email: user.Correo,
        role: user.Tipo_Usuario,
        specialty: 'Medicina Familiar'
      }
    });

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

app.listen(3001, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3001');
  console.log('✅ API Login: POST http://localhost:3001/api/login');
});*/