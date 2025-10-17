import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [tipoUsuario, setTipoUsuario] = useState('Paciente');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!nombre || !apellidos || !email || !password || !confirmPassword || !fechaNacimiento) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellidos, email, telefono, fechaNacimiento, sexo, tipoUsuario, password })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('¡Registro exitoso!', 'Ahora puedes iniciar sesión');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput placeholder="Nombre" style={styles.input} value={nombre} onChangeText={setNombre} />
      <TextInput placeholder="Apellidos" style={styles.input} value={apellidos} onChangeText={setApellidos} />
      <TextInput placeholder="Correo electrónico" style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Teléfono" style={styles.input} keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />
      <TextInput placeholder="Fecha de nacimiento (YYYY-MM-DD)" style={styles.input} value={fechaNacimiento} onChangeText={setFechaNacimiento} />

      <Text style={styles.label}>Sexo</Text>
      <Picker selectedValue={sexo} onValueChange={setSexo} style={Platform.OS === 'ios' ? styles.pickerIOS : styles.picker}>
        <Picker.Item label="Masculino" value="Masculino" />
        <Picker.Item label="Femenino" value="Femenino" />
      </Picker>

      <Text style={styles.label}>Tipo de usuario</Text>
      <Picker selectedValue={tipoUsuario} onValueChange={setTipoUsuario} style={Platform.OS === 'ios' ? styles.pickerIOS : styles.picker}>
        <Picker.Item label="Paciente" value="Paciente" />
        <Picker.Item label="Familiar" value="Familiar" />
      </Picker>

      <TextInput placeholder="Contraseña" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput placeholder="Confirmar Contraseña" style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Registrarme</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 10 },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 10 },
  pickerIOS: { marginBottom: 10 },
  label: { marginBottom: 5, fontWeight: 'bold' },
  btn: { backgroundColor: '#1CB5B9', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#00BFA5', textAlign: 'center', marginTop: 15 },
});
