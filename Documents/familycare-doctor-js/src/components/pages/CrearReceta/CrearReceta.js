import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrearReceta.css';

const CrearReceta = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para los datos principales de la receta
  const [formData, setFormData] = useState({
    correo_paciente: '',
    nombre_paciente: '', // Nuevo campo para nombre del paciente
    diagnostico: '',
    instrucciones: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    via_administracion: ''
  });

  // Estado para los medicamentos (pueden ser múltiples)
  const [medicamentos, setMedicamentos] = useState([
    {
      nombre: '',
      dosis: '',
      frecuencia: '',
      horario: '',
      duracion_dias: ''
    }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleMedicamentoChange = (index, field, value) => {
    const nuevosMedicamentos = [...medicamentos];
    nuevosMedicamentos[index][field] = value;
    setMedicamentos(nuevosMedicamentos);
  };

  const agregarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      {
        nombre: '',
        dosis: '',
        frecuencia: '',
        horario: '',
        duracion_dias: ''
      }
    ]);
  };

  const eliminarMedicamento = (index) => {
    if (medicamentos.length > 1) {
      const nuevosMedicamentos = medicamentos.filter((_, i) => i !== index);
      setMedicamentos(nuevosMedicamentos);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar que todos los campos estén llenos - CORREGIDO
      if (!formData.correo_paciente || !formData.nombre_paciente || !formData.diagnostico || !formData.fecha_emision || !formData.fecha_vencimiento) {
        throw new Error('Por favor complete todos los campos obligatorios');
      }

      // Validar que al menos un medicamento esté completo
      const medicamentoIncompleto = medicamentos.some(med => 
        !med.nombre || !med.dosis || !med.frecuencia || !med.horario || !med.duracion_dias
      );

      if (medicamentoIncompleto) {
        throw new Error('Por favor complete todos los campos de cada medicamento');
      }

      // Preparar datos para enviar al servidor - CORREGIDO
      const recetaData = {
        correo_paciente: formData.correo_paciente,
        nombre_paciente: formData.nombre_paciente,
        diagnostico: formData.diagnostico,
        instrucciones_especificas: formData.instrucciones,
        fecha_emision: formData.fecha_emision,
        fecha_vencimiento: formData.fecha_vencimiento,
        via_administracion: formData.via_administracion,
        medicamentos: medicamentos
      };

      console.log("Enviando receta:", recetaData);

      // Llamada a la API
      const response = await fetch('http://localhost:3001/api/crear-receta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recetaData),
      });

      const result = await response.json();

      if (result.success) {
  alert("Receta creada exitosamente");
  // Pasar datos del paciente a AgendarCita
  navigate('/agendarcita', { 
    state: { 
      paciente: formData.nombre_paciente,
      diagnostico: formData.diagnostico,
      correo_paciente: formData.correo_paciente
    }
  });
}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/panelmedico');
  };

  const handleBack = () => {
    navigate('/panelmedico');
  };

  return (
    <div className="crear-receta-page">
      {/* BOTÓN DE REGRESAR */}
      <div className="back-button-container">
        <button onClick={handleBack} className="back-button">
          ← Regresar al Panel
        </button>
      </div>

      <div className="crear-receta-container">
        <div className="receta-form-card">
          <h2>Crear Nueva Receta Médica</h2>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
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

            {/* CAMPO NOMBRE DEL PACIENTE */}
            <div className="form-group">
              <label>Nombre del Paciente *</label>
              <input
                type="text"
                name="nombre_paciente"
                value={formData.nombre_paciente}
                onChange={handleChange}
                placeholder="Nombre completo del paciente"
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Emisión *</label>
                <input
                  type="date"
                  name="fecha_emision"
                  value={formData.fecha_emision}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Vencimiento *</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={formData.fecha_vencimiento}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* DIAGNÓSTICO */}
            <div className="form-group">
              <label>Diagnóstico *</label>
              <textarea
                name="diagnostico"
                value={formData.diagnostico}
                onChange={handleChange}
                placeholder="Diagnóstico del paciente"
                rows="3"
                required
                disabled={loading}
              />
            </div>

            {/* MEDICAMENTOS */}
            <div className="medicamentos-section">
              <div className="section-header">
                <h3>Medicamentos</h3>
                <button 
                  type="button" 
                  className="btn-agregar"
                  onClick={agregarMedicamento}
                  disabled={loading}
                >
                  + Agregar otro medicamento
                </button>
              </div>

              {medicamentos.map((medicamento, index) => (
                <div key={index} className="medicamento-card">
                  <div className="card-header">
                    <h4>Medicamento {index + 1}</h4>
                    {medicamentos.length > 1 && (
                      <button 
                        type="button" 
                        className="btn-eliminar"
                        onClick={() => eliminarMedicamento(index)}
                        disabled={loading}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="medicamento-fields">
                    <div className="form-group">
                      <label>Nombre del Medicamento *</label>
                      <input
                        type="text"
                        value={medicamento.nombre}
                        onChange={(e) => handleMedicamentoChange(index, 'nombre', e.target.value)}
                        placeholder="Ej: Paracetamol"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Dosis *</label>
                      <input
                        type="text"
                        value={medicamento.dosis}
                        onChange={(e) => handleMedicamentoChange(index, 'dosis', e.target.value)}
                        placeholder="Ej: 500mg"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Frecuencia *</label>
                      <input
                        type="text"
                        value={medicamento.frecuencia}
                        onChange={(e) => handleMedicamentoChange(index, 'frecuencia', e.target.value)}
                        placeholder="Ej: Cada 8 horas"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Horario *</label>
                      <input
                        type="time"
                        value={medicamento.horario}
                        onChange={(e) => handleMedicamentoChange(index, 'horario', e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Duración (días) *</label>
                      <input
                        type="number"
                        value={medicamento.duracion_dias}
                        onChange={(e) => handleMedicamentoChange(index, 'duracion_dias', e.target.value)}
                        placeholder="Ej: 5"
                        min="1"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* INSTRUCCIONES ADICIONALES */}
            <div className="form-group">
              <label>Instrucciones Adicionales</label>
              <textarea
                name="instrucciones"
                value={formData.instrucciones}
                onChange={handleChange}
                placeholder="Instrucciones adicionales para el paciente"
                rows="3"
                disabled={loading}
              />
            </div>

            {/* VÍA DE ADMINISTRACIÓN */}
            <div className="form-group">
              <label>Vía de Administración</label>
              <select
                name="via_administracion"
                value={formData.via_administracion}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Seleccione una opción</option>
                <option value="Oral">Oral</option>
                <option value="Intravenosa">Intravenosa</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Tópica">Tópica</option>
                <option value="Inhalatoria">Inhalatoria</option>
              </select>
            </div>

            {/* BOTONES */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Receta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearReceta;