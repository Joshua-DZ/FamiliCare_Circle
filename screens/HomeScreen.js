import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>👋 Hola, Juan Pérez García</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Tu próxima cita</Text>
        <Text style={styles.text}>📅 06/10/2026 - 05:00 AM</Text>
        <Text style={styles.text}>🏥 Dr. José González, Centro Médico Sur, Torre B piso 3</Text>

        <TouchableOpacity style={styles.button}>
          <Icon name="time-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Ver citas anteriores</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Icon name="document-text-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Consultar recetas activas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, color: '#1CB5B9', fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#E0F2F1', borderRadius: 15, padding: 15 },
  title: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  text: { color: '#555', marginVertical: 5 },
  button: {
    flexDirection: 'row',
    backgroundColor: '#1CB5B9',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
});
