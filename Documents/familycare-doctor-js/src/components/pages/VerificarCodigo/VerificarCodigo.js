// src/components/pages/VerificarCodigo/VerificarCodigo.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerificarCodigo.css';

const VerificarCodigo = () => {
    const [code, setCode] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutos en segundos

    const navigate = useNavigate();
    const location = useLocation();

    // Obtener el email del state de navegación
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // Si no hay email, redirigir al inicio
            navigate('/RecuperarContrasena');
        }
    }, [location, navigate]);

    // Temporizador para el código
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleCodeChange = (index, value) => {
        if (!/^\d?$/.test(value)) return; // Solo números

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus al siguiente input
        if (value !== '' && index < 3) {
            document.getElementById(`code-${index + 1}`).focus();
        }

        // Si se completó el código, verificar automáticamente
        if (newCode.every(digit => digit !== '') && index === 3) {
            handleVerifyCode(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && code[index] === '' && index > 0) {
            document.getElementById(`code-${index - 1}`).focus();
        }
    };

    const handleVerifyCode = async (verificationCode = null) => {
        const finalCode = verificationCode || code.join('');

        if (finalCode.length !== 4) {
            setError('Por favor ingresa el código completo de 4 dígitos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: finalCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Código verificado correctamente');
                // Redirigir a la página de nueva contraseña
                setTimeout(() => {
                    navigate('/NuevaContrasena', {
                        state: {
                            email: email,
                            code: finalCode
                        }
                    });
                }, 1000);
            } else {
                setError(data.message);
                // Limpiar el código en caso de error
                setCode(['', '', '', '']);
                document.getElementById('code-0').focus();
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Nuevo código enviado a tu correo');
                setTimeLeft(600); // Reiniciar temporizador
                setCode(['', '', '', '']);
                document.getElementById('code-0').focus();
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToRecovery = () => {
        navigate('/recuperar-contrasena');
    };

    return (
        <div className="verify-code-page">
            <header className="verify-code-header">
                <div className="logo-container">
                    <img src="/imagenes/logosinfondo.png" alt="FamilyCare Circle" />
                </div>

                <div className="verify-code-icons">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleBackToRecovery}
                    >
                        Volver
                    </button>
                    <i className="icon">🔔</i>
                    <i className="icon">✉️</i>
                    <i className="icon">⚙️</i>
                    <div className="profile-avatar">👤</div>
                </div>
            </header>

            <div className="verify-code-card">
                <h2>Verificar Código</h2>

                <p className="instruction-text">
                    Hemos enviado un código de 4 dígitos a:<br />
                    <strong>{email}</strong>
                </p>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <div className="code-inputs-container">
                    <div className="code-inputs">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="code-input"
                                disabled={loading}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                </div>

                <div className="timer-section">
                    <p className="timer-text">
                        El código expira en: <span className="timer">{formatTime(timeLeft)}</span>
                    </p>
                    {timeLeft <= 0 && (
                        <p className="expired-text">El código ha expirado</p>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleResendCode}
                        disabled={loading || timeLeft > 540} // Solo permitir reenviar después de 1 minuto
                    >
                        Reenviar código
                    </button>

                    <button
                        type="button"
                        className="btn-save"
                        onClick={() => handleVerifyCode()}
                        disabled={loading || code.some(digit => digit === '')}
                    >
                        {loading ? 'Verificando...' : 'Verificar código'}
                    </button>
                </div>

                <div className="back-to-recovery">
                    <button
                        type="button"
                        className="back-link"
                        onClick={handleBackToRecovery}
                    >
                        ← Usar otro correo electrónico
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificarCodigo;