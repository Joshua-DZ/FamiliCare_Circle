const db = require('../db/db');

// Registro
exports.registerController = async (req, res) => {
  const { nombre, apellidos, email, telefono, fechaNacimiento, sexo, tipoUsuario, password } = req.body;

  if (!nombre || !apellidos || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verifica si el correo ya existe
    const [rows] = await db.query('SELECT * FROM usuarios WHERE Correo = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Inserta nuevo usuario
    const [result] = await db.query(
      'INSERT INTO usuarios (Nombre, Apellidos, Fecha_Nacimiento, Sexo, Correo, Telefono, Contraseña, Tipo_Usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, fechaNacimiento, sexo, email, telefono, password, tipoUsuario]
    );

    res.json({ message: 'Registro exitoso', ID_Usuario: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Login tradicional
exports.loginController = async (req, res) => { /* ... */ }

// Login Google
exports.loginGoogleController = async (req, res) => { /* ... */ }
