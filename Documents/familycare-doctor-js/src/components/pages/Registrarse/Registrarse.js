import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Registrarse.css";

export default function Registrarse() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    especialidad: "",
    cedulaProfessional: "",
    correo: "",
    telefono: "",
    contraseña: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Función para validar datos del formulario
  const validateForm = () => {
    // Campos obligatorios
    if (!formData.nombre || !formData.apellidos || !formData.especialidad || 
        !formData.cedulaProfessional || !formData.correo || !formData.contraseña) {
      return "Por favor, completar todos los campos obligatorios";
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      return "Por favor, ingresar un correo válido";
    }

    // Validación de contraseña
    if (formData.contraseña.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    return null; // Sin errores
  };

  /* Manejar el envio de los datos en el formulario */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Efectuar validaciones
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Pasa las validaciones, continua con...
    try {
      console.log("Datos del Médico:", formData);
      // Llamada a api - PARA MÉDICOS usa /api/registrarse
      const response = await fetch("http://localhost:3001/api/registrarse", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          especialidad: formData.especialidad,
          cedula: formData.cedulaProfessional,
          email: formData.correo,
          telefono: formData.telefono,
          password: formData.contraseña
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert("Registro exitoso 🎉");
        navigate("/dashboard");
      } else {
        setError(result.message || "Error en el registro");
      }
    } catch (err) {
      setError("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="logo-container">
          <img src="/imagenes/logosinfondo.png" alt="FamilyCare Circle" />
        </div>

        <div className="login-icons">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleBackToDashboard}
          >
            Volver al inicio
          </button>
          <i className="icon">🔔</i>
          <i className="icon">✉️</i>
          <i className="icon">⚙️</i>
          <div className="profile-avatar">👤</div>
        </div>
      </header>

      <div className="login-card">
        <h2>Registro de Médico</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* NOMBRE - Campo para escribir */}
          <div className="form-row required">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Ingresa tu nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* APELLIDOS - Campo para escribir */}
          <div className="form-row required">
            <label>Apellidos</label>
            <input
              type="text"
              name="apellidos"
              placeholder="Ingresa tus apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* ESPECIALIDAD - Campo para escribir */}
          <div className="form-row required">
            <label>Especialidad</label>
            <input
              type="text"
              name="especialidad"
              placeholder="Tu especialidad médica"
              value={formData.especialidad}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* CÉDULA PROFESIONAL - Campo para escribir */}
          <div className="form-row required">
            <label>Cédula Profesional</label>
            <input
              type="text"
              name="cedulaProfessional"
              placeholder="Número de cédula profesional"
              value={formData.cedulaProfessional}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* CORREO - Campo para escribir */}
          <div className="form-row required">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              placeholder="correo@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* TELÉFONO - Campo para escribir */}
          <div className="form-row">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              placeholder="Número de teléfono (opcional)"
              value={formData.telefono}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* CONTRASEÑA - Campo para escribir */}
          <div className="form-row required">
            <label>Contraseña</label>
            <input
              type="password"
              name="contraseña"
              placeholder="Mínimo 6 caracteres"
              value={formData.contraseña}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          {/* BOTONES */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleBackToDashboard}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar Médico"}
            </button>
          </div>
        </form>

        <div className="login-hint">
          <p><strong>Campos obligatorios *</strong></p>
          <p>La cédula profesional debe ser única en el sistema</p>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}