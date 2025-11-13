import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./RegistroCliente.css";

export default function RegistrarCliente() {
    // Estado para manejar los datos del formulario
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        fecha_de_nacimiento: "",
        sexo: "",
        correo: "",
        telefono: "",
        contraseña: "",
        tipo_de_paciente: "",
        relacion: "" // Nuevo campo para familiares
    })

    // Estados para manejar errores de carga
    const [error, setError] = useState(""); // Mensajes de error
    const [loading, setLoading] = useState(false); // Estado de carga durante el registro

    // Hook de navegacion
    const navigate = useNavigate();

    // Función para volver al dashboard
    const handleBackToDashboard = () => {
        navigate('/panelmedico');
    };

    // Funcion para validar datos del formulario
    const validateForm = () => {
        // Campos obligatorios
        if (!formData.nombre || !formData.apellidos || !formData.fecha_de_nacimiento || !formData.sexo || !formData.correo || !formData.telefono || !formData.contraseña || !formData.tipo_de_paciente) {
            return "Por favor. Completar todos los campos";
        }

        // Si es Familiar, validar el campo relación
        if (formData.tipo_de_paciente === 'Familiar' && !formData.relacion) {
            return "Por favor. Ingresar la relación con el paciente";
        }

        // Caracteres permitidos (letras mayu-minus y espacios)
        const nombreRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/;
        // Validacion para Nombre
        if (!nombreRegex.test(formData.nombre)) {
            return "El nombre solo puede contener letras y espacios";
        }

        // Validacion para apellidos
        if (!nombreRegex.test(formData.apellidos)) {
            return "Los apellidos solo pueden contener letras y espacios";
        }

        const telefonoRegex = /^[0-9]{10}$/;
        // Validacion para telefono
        if (!telefonoRegex.test(formData.telefono)) {
            return "Su número telefónico sólo debe tener 10 dígitos";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Validacion para correo
        if (!emailRegex.test(formData.correo)) {
            return "Por favor. Ingresar un correo válido";
        }

        // Validacion para contraseña
        if (formData.contraseña.length < 6) {
            return "La contraseña debe tener al menos 6 caracteres";
        }

        return null; // Sin errores
    }

    /* Manejar cambios de estado en el formulario */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
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
            console.log("Datos del Usuario:", formData);
            
            // DECIDIR A DÓNDE REGISTRAR BASADO EN tipo_de_paciente
            const url = formData.tipo_de_paciente === 'Paciente' 
                ? "http://localhost:3001/api/registro-paciente" 
                : "http://localhost:3001/api/registro-familiar";
            
            // Preparar datos según el tipo
            const requestData = {
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                fecha_de_nacimiento: formData.fecha_de_nacimiento,
                sexo: formData.sexo,
                email: formData.correo,
                telefono: formData.telefono,
                password: formData.contraseña
            };

            // Solo agregar relación si es Familiar
            if (formData.tipo_de_paciente === 'Familiar') {
                requestData.relacion = formData.relacion;
            }

            // Llamada a api
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            // Esperando resultado
            const result = await response.json();

            if (result.success) {
                alert("Registro exitoso.");
                navigate("/panelmedico");
            } else {
                setError(result.message || "Error en el registro");
            }
        } catch (err) {
            setError("Error en la conexión con el servidor");
        } finally {
            setLoading(false);
        }
    }

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
                <h2>Registro de Usuario</h2>

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

                    {/* FECHA DE NACIMIENTO - Campo para fecha */}
                    <div className="form-row required">
                        <label>Fecha de Nacimiento</label>
                        <input
                            type="date"
                            name="fecha_de_nacimiento"
                            value={formData.fecha_de_nacimiento}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* SEXO - Select para elegir */}
                    <div className="form-row required">
                        <label>Sexo</label>
                        <select
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Selecciona tu sexo</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                            <option value="Prefiero no decir">Prefiero no decir</option>
                        </select>
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
                    <div className="form-row required">
                        <label>Teléfono</label>
                        <input
                            type="tel"
                            name="telefono"
                            placeholder="Número de teléfono (10 dígitos)"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
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

                    {/* TIPO DE USUARIO - Select para elegir */}
                    <div className="form-row required">
                        <label>Tipo de Usuario</label>
                        <select
                            name="tipo_de_paciente"
                            value={formData.tipo_de_paciente}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Selecciona tipo de usuario</option>
                            <option value="Paciente">Paciente</option>
                            <option value="Familiar">Familiar</option>
                        </select>
                    </div>

                    {/* RELACIÓN - Solo visible para Familiares */}
                    {formData.tipo_de_paciente === 'Familiar' && (
                        <div className="form-row required">
                            <label>Relación con el Paciente</label>
                            <input
                                type="text"
                                name="relacion"
                                placeholder="Ej: Padre, Madre, Hijo, Esposo, etc."
                                value={formData.relacion}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

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
                            {loading ? "Registrando..." : "Registrar Usuario"}
                        </button>
                    </div>
                </form>

                <div className="login-hint">
                    <p><strong>Campos obligatorios *</strong></p>
                    <p>El correo electrónico debe ser único en el sistema</p>
                </div>

                
            </div>
        </div>
    );
}