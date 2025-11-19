// src/components/pages/NuevaContrasena/NuevaContrasena.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NuevaContrasena.css';

const NuevaContrasena = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    // Obtener email y código del state de navegación
    useEffect(() => {
        if (location.state?.email && location.state?.code) {
            setEmail(location.state.email);
            setCode(location.state.code);
        } else {
            // Si no hay datos, redirigir al inicio
            navigate('/recuperar-contrasena');
        }
    }, [location, navigate]);

    // Validar fortaleza de contraseña
    useEffect(() => {
        const strength = checkPasswordStrength(formData.password);
        setPasswordStrength(strength);
    }, [formData.password]);

    const checkPasswordStrength = (password) => {
        if (password.length === 0) return '';

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 0:
            case 1:
                return 'débil';
            case 2:
                return 'media';
            case 3:
                return 'fuerte';
            case 4:
                return 'muy fuerte';
            default:
                return '';
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'débil':
                return '#e74c3c';
            case 'media':
                return '#f39c12';
            case 'fuerte':
                return '#27ae60';
            case 'muy fuerte':
                return '#2ecc71';
            default:
                return '#ddd';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.password || !formData.confirmPassword) {
            setError('Todos los campos son obligatorios');
            return false;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: code,
                    newPassword: formData.password
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Contraseña actualizada correctamente');

                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Tu contraseña ha sido actualizada. Inicia sesión con tu nueva contraseña.'
                        }
                    });
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToVerification = () => {
        navigate('/verificar-codigo', { state: { email } });
    };

    return (
        <div className="new-password-page">
            <header className="new-password-header">
                <div className="logo-container">
                    <img src="/imagenes/logosinfondo.png" alt="FamilyCare Circle" />
                </div>

                <div className="new-password-icons">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleBackToVerification}
                    >
                        Volver
                    </button>
                    <i className="icon">🔔</i>
                    <i className="icon">✉️</i>
                    <i className="icon">⚙️</i>
                    <div className="profile-avatar">👤</div>
                </div>
            </header>

            <div className="new-password-card">
                <h2>Crear Nueva Contraseña</h2>

                <p className="instruction-text">
                    Crea una nueva contraseña para tu cuenta:<br />
                    <strong>{email}</strong>
                </p>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label>Nueva Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ingresa tu nueva contraseña"
                            required
                            disabled={loading}
                        />
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: passwordStrength === 'débil' ? '25%' :
                                                passwordStrength === 'media' ? '50%' :
                                                    passwordStrength === 'fuerte' ? '75%' :
                                                        passwordStrength === 'muy fuerte' ? '100%' : '0%',
                                            backgroundColor: getPasswordStrengthColor()
                                        }}
                                    ></div>
                                </div>
                                <span
                                    className="strength-text"
                                    style={{ color: getPasswordStrengthColor() }}
                                >
                                    Fortaleza: {passwordStrength}
                                </span>
                            </div>
                        )}
                        <div className="password-requirements">
                            <p>La contraseña debe contener:</p>
                            <ul>
                                <li className={formData.password.length >= 8 ? 'valid' : ''}>
                                    Al menos 8 caracteres
                                </li>
                                <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                                    Una letra mayúscula
                                </li>
                                <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                                    Un número
                                </li>
                                <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'valid' : ''}>
                                    Un carácter especial
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="form-row">
                        <label>Confirmar Contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirma tu nueva contraseña"
                            required
                            disabled={loading}
                        />
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <div className="password-match valid">
                                ✓ Las contraseñas coinciden
                            </div>
                        )}
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <div className="password-match invalid">
                                ✗ Las contraseñas no coinciden
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleBackToVerification}
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={loading}
                        >
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NuevaContrasena;