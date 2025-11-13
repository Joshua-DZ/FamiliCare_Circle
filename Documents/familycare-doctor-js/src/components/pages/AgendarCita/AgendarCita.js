import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './AgendarCita.css';

const AgendarCita = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [especialidades, setEspecialidades] = useState([]);
  const [medicoAsignado, setMedicoAsignado] = useState(null);
  const [buscandoMedico, setBuscandoMedico] = useState(false);
  
  // Obtener datos del paciente si vienen de CrearReceta
  const { paciente = '', diagnostico = '', correo_paciente = '' } = location.state || {};

  const [formData, setFormData] = useState({
    correo_paciente: correo_paciente,
    paciente: paciente,
    fecha: '',
    hora: '09:00',
    especialidad: user?.specialty || 'Medicina General',
    tipo: 'Consulta de Seguimiento',
    motivo: diagnostico || '',
    notas: ''
  });

  // Cargar especialidades al montar el componente
  useEffect(() => {
    cargarEspecialidades();
  }, []);

  // Buscar médico automáticamente cuando se cargan las especialidades
  useEffect(() => {
    if (especialidades.length > 0 && formData.especialidad) {
      buscarMedicoPorEspecialidad(formData.especialidad);
    }
  }, [especialidades, formData.especialidad]);

  const cargarEspecialidades = async () => {
    try {
      console.log('🔄 Cargando especialidades...');
      const response = await fetch('http://localhost:3001/api/especialidades');
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Especialidades cargadas:', result.especialidades);
        setEspecialidades(result.especialidades);
      } else {
        setError('Error al cargar especialidades');
      }
    } catch (err) {
      console.error('❌ Error al cargar especialidades:', err);
      setError('No se pudieron cargar las especialidades');
      // Cargar especialidades por defecto
      setEspecialidades(['Medicina General', 'Cardiología', 'Pediatría', 'Dermatología']);
    }
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

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Si cambia la especialidad, buscar médico automáticamente
    if (name === 'especialidad') {
      buscarMedicoPorEspecialidad(value);
    }
  };

  // Buscar médico por especialidad
  const buscarMedicoPorEspecialidad = async (especialidad) => {
    if (!especialidad) {
      setMedicoAsignado(null);
      setError('Seleccione una especialidad');
      return;
    }

    setBuscandoMedico(true);
    setError('');
    
    try {
      console.log(`🔍 Buscando médico para: ${especialidad}`);
      const response = await fetch(`http://localhost:3001/api/buscar-medico-especialidad?especialidad=${encodeURIComponent(especialidad)}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.medico) {
        console.log('✅ Médico encontrado:', result.medico);
        setMedicoAsignado(result.medico);
        setError('');
      } else {
        console.log('❌ No hay médico disponible');
        setMedicoAsignado(null);
        setError(`No hay médicos disponibles para: ${especialidad}`);
      }
    } catch (err) {
      console.error('❌ Error al buscar médico:', err);
      setMedicoAsignado(null);
      setError('Error al conectar con el servidor');
    } finally {
      setBuscandoMedico(false);
    }
  };

  const guardarCita = async () => {
    // Validaciones
    if (!formData.correo_paciente || !formData.paciente || !formData.fecha) {
      setError('Por favor completa los campos obligatorios (*)');
      return;
    }

    if (!medicoAsignado) {
      setError('No hay médico disponible para la especialidad seleccionada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const citaData = {
        correo_paciente: formData.correo_paciente,
        paciente_nombre: formData.paciente,
        fecha: formData.fecha,
        hora: `${formData.hora}:00`,
        tipo: formData.tipo,
        motivo: formData.motivo,
        notas: formData.notas,
        especialidad: formData.especialidad,
        ubicacion: 'Consultorio Principal',
        estado: 'Pendiente',
        id_medico: medicoAsignado.ID_Medico
      };

      console.log("📤 Enviando cita:", citaData);

      const response = await fetch('http://localhost:3001/api/agendar-cita', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(citaData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Cita agendada exitosamente');
        alert('Cita agendada exitosamente');
        navigate('/citamedica');
      } else {
        setError(result.message || 'Error al agendar la cita');
      }

    } catch (error) {
      console.error('❌ Error al guardar cita:', error);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/crearreceta');
  };

  const handleBack = () => {
    navigate('/panelmedico');
  };

  return (
    <div className="agendar-cita-page">
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
              }}
            />
            <div className="logo-fallback">
              <span className="logo-text">FAMILYCARE</span>
              <span className="logo-circle">●</span>
            </div>
          </div>
          
          {/* MENSAJE DE BIENVENIDA EN LA BARRA */}
          <div className="welcome-message">
            <h2>Agendar Cita Médica</h2>
            <p>Programar nueva consulta para el paciente</p>
          </div>
          
          <nav className="panel-nav">
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

      {/* CONTENIDO DEL FORMULARIO */}
      <div className="agendar-cita-container">
        <div className="agendar-cita-content">
          <button onClick={handleBack} className="back-button">
            ← Regresar al Panel
          </button>
          
          <div className="cita-form-card">
            <h3>Agendar Nueva Cita</h3>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={(e) => e.preventDefault()}>
              {/* CAMPO CORREO DEL PACIENTE */}
              <div className="form-group">
                <label>Correo del Paciente *</label>
                <input
                  type="email"
                  name="correo_paciente"
                  value={formData.correo_paciente}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Paciente *</label>
                <input
                  type="text"
                  name="paciente"
                  value={formData.paciente}
                  onChange={handleChange}
                  placeholder="Nombre completo del paciente"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Hora *</label>
                  <select
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* ESPECIALIDAD REQUERIDA */}
              <div className="form-group">
                <label>Especialidad Requerida *</label>
                <select
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  required
                  disabled={loading || buscandoMedico}
                >
                  <option value="">Seleccione especialidad</option>
                  {especialidades.map((especialidad, index) => (
                    <option key={index} value={especialidad}>
                      {especialidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* MÉDICO ASIGNADO */}
              <div className="medico-asignado-info">
                <label>Médico Asignado:</label>
                {buscandoMedico ? (
                  <div className="buscando-medico">Buscando médico especialista...</div>
                ) : medicoAsignado ? (
                  <div className="medico-encontrado">
                    <strong>Dr. {medicoAsignado.Nombre} {medicoAsignado.Apellidos}</strong>
                    <div className="medico-detalles">
                      Especialidad: {medicoAsignado.Especialidad}
                      {medicoAsignado.Cedula_Profesional && 
                        ` • Cédula: ${medicoAsignado.Cedula_Profesional}`}
                    </div>
                  </div>
                ) : formData.especialidad ? (
                  <div className="medico-no-disponible">
                    No disponible - No hay médicos para esta especialidad
                  </div>
                ) : (
                  <div className="medico-no-seleccionado">
                    Seleccione una especialidad para buscar médico
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tipo de Cita</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Consulta de Seguimiento">Consulta de Seguimiento</option>
                  <option value="Consulta General">Consulta General</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Revisión">Revisión</option>
                  <option value="Control">Control</option>
                </select>
              </div>

              <div className="form-group">
                <label>Motivo de la Cita</label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  placeholder="Motivo de la consulta"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Notas Adicionales</label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  placeholder="Notas adicionales para la cita"
                  rows="2"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn-guardar" 
                  onClick={guardarCita} 
                  disabled={loading || !medicoAsignado}
                >
                  {loading ? 'Agendando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendarCita;