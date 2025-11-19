import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/pages/Login/Login';
import Dashboard from './components/pages/Dashboard/Dashboard';
import { useAuth } from './contexts/AuthContext';
import Registrarse from './components/pages/Registrarse/Registrarse';
import PanelMedico from './components/pages/PanelMedico/PanelMedico';
import RegistroCliente from './components/pages/RegistroPaciente/RegistroCliente';
import CitasMedicas from './components/pages/CitasMedicas/CitasMedicas';
import CrearReceta from './components/pages/CrearReceta/CrearReceta';
import HistorialMedico from './components/pages/HistorialMedico/HistorialMedico';
import AgendarCita from './components/pages/AgendarCita/AgendarCita';
import RecuperarContrasena from './components/pages/RecuperarContrasena/RecuperarContrasena';
import VerificarCodigo from './components/pages/VerificarCodigo/VerificarCodigo';
import NuevaContrasena from './components/pages/NuevaContrasena/NuevaContrasena';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return user ? children : <verNavigate to="/login" />;
}

function PublicDashboard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PublicDashboard><Dashboard /></PublicDashboard>} />
        <Route path="/registrarse" element={<Registrarse />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path='/panelmedico' element={<PanelMedico />} />
        <Route path='/Registropaciente' element={<RegistroCliente />} />
        <Route path='/citamedica' element={<CitasMedicas />} />
        <Route path='/crearreceta' element={<CrearReceta />} />
        <Route path='/historialmedico' element={<HistorialMedico />} />
        <Route path='/agendarcita' element={<AgendarCita />} />
        <Route path="/Recuperarcontrasena" element={<RecuperarContrasena />} />
        <Route path="/VerificarCodigo" element={<VerificarCodigo />} />
        <Route path="/NuevaContrasena" element={<NuevaContrasena />} />
      </Routes>
    </Router>
  );
}

export default App;