const express = require('express');
const router = express.Router();
const { registerController, loginController, loginGoogleController } = require('../controllers/authController');

// Registro
router.post('/register', registerController);

// Login tradicional
router.post('/login', loginController);

// Login con Google
router.post('/login-google', loginGoogleController);

module.exports = router;
