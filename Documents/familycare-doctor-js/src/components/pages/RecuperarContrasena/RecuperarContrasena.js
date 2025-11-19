// src/pages/RecuperarContrasena.jsx  (sin ñ)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RecuperarContrasena.css';

const RecuperarContrasena = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // LLAMADA REAL a backend
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Envía el email al backend
      });
      // Backend responde
      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        // Redirigir a la página de verificación de código después de 2 segundos
        setTimeout(() => {
          navigate('/VerificarCodigo', { state: { email } });
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.'); // Error del backend
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-password-page">
      <header className="login-header">
        <div className="logo-container">
          <img src="/imagenes/logosinfondo.png" alt="FamilyCare Circle" />
        </div>

        <div className="login-icons">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleBackToLogin}
          >
            Volver al inicio
          </button>
          <i className="icon">🔔</i>
          <i className="icon">✉️</i>
          <i className="icon">⚙️</i>
          <div className="profile-avatar">👤</div>
        </div>
      </header>

      <div className="forgot-password-card">
        <h2>Recuperar Contraseña</h2>
        <p className="instruction-text">
          Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@familycare.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleBackToLogin}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        </form>

        <div className="back-to-login">
          <Link to="/login" className="back-link">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;