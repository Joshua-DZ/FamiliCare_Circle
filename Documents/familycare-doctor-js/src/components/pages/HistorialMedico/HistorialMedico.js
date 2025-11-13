import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './HistorialMedico.css';

const HistorialMedico = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [correoBusqueda, setCorreoBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paciente, setPaciente] = useState(null);
  const [recetas, setRecetas] = useState([]);
  const [citas, setCitas] = useState([]);

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

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/panelmedico');
  };

  // Función para buscar paciente por correo
  const buscarPaciente = async () => {
    if (!correoBusqueda) {
      setError('Por favor ingrese un correo electrónico');
      return;
    }

    setLoading(true);
    setError('');
    setPaciente(null);
    setRecetas([]);
    setCitas([]);

    try {
      // Buscar información del paciente
      const responsePaciente = await fetch(`http://localhost:3001/api/buscar-paciente-historial?correo=${correoBusqueda}`);
      const resultPaciente = await responsePaciente.json();

      if (!resultPaciente.success) {
        setError('Paciente no encontrado');
        setLoading(false);
        return;
      }

      setPaciente(resultPaciente.paciente);

      // Buscar recetas del paciente
      const responseRecetas = await fetch(`http://localhost:3001/api/recetas-paciente?correo=${correoBusqueda}`);
      const resultRecetas = await responseRecetas.json();

      if (resultRecetas.success) {
        setRecetas(resultRecetas.recetas);
      }

      // Buscar citas del paciente
      const responseCitas = await fetch(`http://localhost:3001/api/citas-paciente?correo=${correoBusqueda}`);
      const resultCitas = await responseCitas.json();

      if (resultCitas.success) {
        setCitas(resultCitas.citas);
      }

    } catch (err) {
      setError('Error al buscar información del paciente');
    } finally {
      setLoading(false);
    }
  };

  // Calcular edad desde fecha de nacimiento
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'No especificada';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return `${edad} años`;
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  return (
    <div className="historial-medico-page">
      {/* BARRA SUPERIOR COMPLETA */}
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
            <h2>Historial Médico</h2>
            <p>Consulta completa del paciente</p>
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

      {/* CONTENIDO DEL HISTORIAL MÉDICO */}
      <div className="historial-container">
        <div className="historial-content">
          <button onClick={handleBack} className="back-button">
            ← Regresar al Panel
          </button>
          
          {/* BARRA DE BÚSQUEDA */}
          <div className="busqueda-section">
            <h3>Buscar Paciente por Correo</h3>
            <div className="busqueda-container">
              <input
                type="email"
                value={correoBusqueda}
                onChange={(e) => setCorreoBusqueda(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="busqueda-input"
              />
              <button 
                onClick={buscarPaciente} 
                className="btn-buscar"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>

          {paciente && (
            <div className="historial-card">
              <h3>Historial Médico de {paciente.Nombre} {paciente.Apellidos}</h3>
              
              <div className="seccion-info">
                <h4>Información Personal</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nombre Completo:</label>
                    <span>{paciente.Nombre} {paciente.Apellidos}</span>
                  </div>
                  <div className="info-item">
                    <label>Correo Electrónico:</label>
                    <span>{paciente.Correo}</span>
                  </div>
                  <div className="info-item">
                    <label>Teléfono:</label>
                    <span>{paciente.Telefono || 'No registrado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Sexo:</label>
                    <span>{paciente.Sexo || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Edad:</label>
                    <span>{calcularEdad(paciente.Fecha_Nacimiento)}</span>
                  </div>
                  <div className="info-item">
                    <label>Fecha de Nacimiento:</label>
                    <span>{formatearFecha(paciente.Fecha_Nacimiento)}</span>
                  </div>
                </div>
              </div>

              <div className="seccion-info">
                <h4>Recetas Médicas ({recetas.length})</h4>
                {recetas.length > 0 ? (
                  <div className="recetas-lista">
                    {recetas.map((receta) => (
                      <div key={receta.ID_Receta} className="receta-item">
                        <div className="receta-header">
                          <strong>Receta #{receta.ID_Receta}</strong>
                          <span className="fecha-receta">{formatearFecha(receta.Fecha_Emision)}</span>
                        </div>
                        <div className="receta-diagnostico">
                          <strong>Diagnóstico:</strong> {receta.Diagnostico}
                        </div>
                        <div className="receta-medicamentos">
                          <strong>Medicamentos:</strong> {receta.Medicamentos}
                        </div>
                        <div className="receta-detalles">
                          <span>Dosis: {receta.Dosis}</span>
                          <span>Frecuencia: {receta.Frecuencia}</span>
                          <span>Duración: {receta.Duracion_Dias} días</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="info-texto">No hay recetas registradas</div>
                )}
              </div>

              <div className="seccion-info">
                <h4>Citas Médicas ({citas.length})</h4>
                {citas.length > 0 ? (
                  <div className="citas-lista">
                    {citas.map((cita) => (
                      <div key={cita.ID_Cita} className="cita-item">
                        <div className="cita-fecha">
                          <strong>{formatearFecha(cita.Fecha)}</strong> a las {cita.Hora}
                        </div>
                        <div className="cita-detalles">
                          <span>Estado: {cita.Estado}</span>
                          <span>Motivo: {cita.Motivo || 'No especificado'}</span>
                          {cita.Especialidad && <span>Especialidad: {cita.Especialidad}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="info-texto">No hay citas registradas</div>
                )}
              </div>

              <div className="seccion-info">
                <h4>Resumen Médico</h4>
                <div className="info-texto">
                  <p><strong>Total de recetas:</strong> {recetas.length}</p>
                  <p><strong>Total de citas:</strong> {citas.length}</p>
                  <p><strong>Última receta:</strong> {recetas.length > 0 ? formatearFecha(recetas[0].Fecha_Emision) : 'N/A'}</p>
                  <p><strong>Última cita:</strong> {citas.length > 0 ? formatearFecha(citas[0].Fecha) : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialMedico;