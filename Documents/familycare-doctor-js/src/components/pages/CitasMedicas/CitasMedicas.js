import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './CitasMedicas.css';

const CitasMedicas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar citas cuando cambie el usuario o la fecha
  useEffect(() => {
    if (user?.id) {
      cargarCitas();
    }
  }, [user]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Cargando citas para médico ID:', user?.id);
      
      const response = await fetch(`http://localhost:3001/api/citas-medico?id_medico=${user?.id}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Citas cargadas:', result.citas.length);
        setCitas(result.citas);
      } else {
        setError(result.message || 'Error al cargar las citas');
      }
    } catch (err) {
      console.error('❌ Error al cargar citas:', err);
      setError('Error de conexión al servidor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/panelmedico');
  };

  const handleDateChange = (e) => {
    setFechaSeleccionada(e.target.value);
  };

  const getFechaFormateada = (fecha) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', options);
  };

  // Filtrar citas por fecha seleccionada
  const citasFiltradas = citas.filter(cita => {
    // Asegurarse de que la fecha esté en formato YYYY-MM-DD
    const fechaCita = new Date(cita.Fecha).toISOString().split('T')[0];
    return fechaCita === fechaSeleccionada;
  });

  // Formatear hora para mostrar
  const formatearHora = (hora) => {
    if (!hora) return '';
    
    // Si la hora ya está en formato AM/PM, dejarla como está
    if (hora.includes('AM') || hora.includes('PM')) return hora;
    
    // Si viene en formato 24h (HH:MM:SS o HH:MM), convertir a 12h
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const ampm = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum % 12 || 12;
    return `${hora12}:${minutos} ${ampm}`;
  };

  // Obtener nombre completo del paciente
  const getNombrePaciente = (cita) => {
    return `${cita.Paciente_Nombre || ''} ${cita.Paciente_Apellidos || ''}`.trim();
  };

  // Función para recargar citas
  const handleRecargar = () => {
    cargarCitas();
  };

  return (
    <div className="citas-medicas-page">
      {/* BARRA SUPERIOR */}
      <header className="citas-header">
        <div className="citas-top">
          <button onClick={handleBack} className="back-button">
            ← Regresar al Panel
          </button>
          
          <div className="citas-title">
            <h1>Citas Médicas</h1>
            <p>Dr. {user?.name || 'Médico'} - {user?.specialty || 'Especialidad'}</p>
          </div>

          <div className="header-controls">
            <div className="fecha-container">
              <label>Fecha:</label>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={handleDateChange}
                className="fecha-selector"
              />
            </div>
            
            <button onClick={handleRecargar} className="btn-recargar" disabled={loading}>
              {loading ? '🔄' : '↻'}
            </button>
          </div>
        </div>
        
        <div className="fecha-actual">
          {getFechaFormateada(fechaSeleccionada)}
          <span className="citas-count">
            {citasFiltradas.length} {citasFiltradas.length === 1 ? 'cita' : 'citas'} programada{citasFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* MENSAJES DE ESTADO */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleRecargar} className="btn-reintentar">
            Reintentar
          </button>
        </div>
      )}

      {/* TABLA DE CITAS */}
      <div className="citas-container">
        {loading ? (
          <div className="loading-message">Cargando citas...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="no-citas-message">
            {citas.length === 0 
              ? 'No tienes citas programadas' 
              : `No hay citas programadas para el ${getFechaFormateada(fechaSeleccionada)}`
            }
            <br />
            <small>Total de citas en tu agenda: {citas.length}</small>
          </div>
        ) : (
          <div className="citas-grid">
            {/* ENCABEZADOS */}
            <div className="cita-header paciente">Paciente</div>
            <div className="cita-header hora">Hora</div>
            <div className="cita-header tipo">Especialidad</div>
            <div className="cita-header notas">Motivo</div>
            <div className="cita-header estado">Estado</div>

            {/* CITAS */}
            {citasFiltradas.map((cita) => (
              <React.Fragment key={cita.ID_Cita}>
                <div className="cita-item paciente">
                  <div className="cita-paciente">
                    <strong>{getNombrePaciente(cita)}</strong>
                    <div className="cita-correo">{cita.Paciente_Correo}</div>
                    {cita.Paciente_Telefono && (
                      <div className="cita-telefono">📞 {cita.Paciente_Telefono}</div>
                    )}
                  </div>
                </div>
                
                <div className="cita-item hora">
                  <div className="cita-hora">{formatearHora(cita.Hora)}</div>
                </div>
                
                <div className="cita-item tipo">
                  <div className="cita-tipo">
                    {cita.Especialidad || 'Consulta General'}
                  </div>
                </div>
                
                <div className="cita-item notas">
                  <div className="cita-notas">
                    {cita.Motivo || 'Sin motivo especificado'}
                  </div>
                </div>
                
                <div className="cita-item estado">
                  <div className={`cita-estado ${cita.Estado?.toLowerCase() || 'pendiente'}`}>
                    {cita.Estado || 'Pendiente'}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitasMedicas;