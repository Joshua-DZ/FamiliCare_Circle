import React from 'react';
import './PanelMedico.css';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PanelMedico = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  // Funciones para los iconos
  const handleNotifications = () => {
    console.log("Abrir notificaciones");
  };

  const handleMessages = () => {
    console.log("Abrir mensajes");
  };

  const handleSettings = () => {
    console.log("Abrir ajustes");
  };

  const handleProfile = () => {
    console.log("Abrir perfil");
  };

  // Funciones para los botones médicos
  const handleAltaPacientes = () => {
  navigate('/Registropaciente');
};

  const handleCitasMedicas = () => {
    navigate('/citamedica');
  };

  const handleCrearReceta = () => {
    navigate('/crearreceta'); // ✅ CAMBIADO: Ahora navega a la página de crear receta
  };

  const handleHistorialPaciente = () => {
    navigate("/historialmedico");
  };

  return (
    <div className="panel-medico">
      <header className="panel-header">
        <div className="panel-top">
          <div className="logo-container">
            <img 
              src="/imagenes/logosinfondo.png" 
              alt="FamilyCare Circle" 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.querySelector('.logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback">
              <span className="logo-text">FAMILYCARE</span>
              <span className="logo-circle">●</span>
            </div>
          </div>
          
          {/* MENSAJE DE BIENVENIDA EN LA BARRA */}
          <div className="welcome-message">
            <h2>Bienvenido Doctor {user?.name || 'Médico'}</h2>
            <p>Panel de control médico profesional</p>
          </div>
          
          <nav className="panel-nav">
            {/* ICONOS */}
            <button onClick={handleNotifications} className="nav-icon">
              🔔
            </button>
            
            <button onClick={handleMessages} className="nav-icon">
              ✉️
            </button>
            
            <button onClick={handleSettings} className="nav-icon">
              ⚙️
            </button>
            
            <button onClick={handleProfile} className="nav-icon">
              👤
            </button>
            
            <button onClick={handleLogout} className="nav-button">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      {/* SOLO LOS BOTONES MÉDICOS - SIN IMAGEN */}
      <div className="doctor-section">
        <div className="doctor-container">
          <div className="doctor-buttons-grid">
            <button className="doctor-button" onClick={handleAltaPacientes}>
              <div className="button-icon">👥</div>
              <div className="button-content">
                <h3>Dar de Alta Pacientes</h3>
                <p>Registrar nuevos pacientes en el sistema</p>
              </div>
            </button>

            <button className="doctor-button" onClick={handleCitasMedicas}>
              <div className="button-icon">📅</div>
              <div className="button-content">
                <h3>Citas Médicas</h3>
                <p>Gestionar agenda de citas y consultas</p>
              </div>
            </button>

            <button className="doctor-button" onClick={handleCrearReceta}>
              <div className="button-icon">💊</div>
              <div className="button-content">
                <h3>Crear Receta</h3>
                <p>Generar recetas médicas digitales</p>
              </div>
            </button>

            <button className="doctor-button" onClick={handleHistorialPaciente}>
              <div className="button-icon">📋</div>
              <div className="button-content">
                <h3>Historial del Paciente</h3>
                <p>Consultar historial médico completo</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelMedico;