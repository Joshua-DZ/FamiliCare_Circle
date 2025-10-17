import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CategoryScreen() {
  const [selected, setSelected] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cuál categoría deseas usar?</Text>
      <Text style={styles.subtitle}>Escoge una opción</Text>

      <TouchableOpacity
        style={[styles.option, selected === 'paciente' && styles.selected]}
        onPress={() => setSelected('paciente')}
      >
        <Text style={styles.optionText}>Soy paciente</Text>
        <Text style={styles.optionSub}>Comparto mis datos de salud con mi familia</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, selected === 'familia' && styles.selected]}
        onPress={() => setSelected('familia')}
      >
        <Text style={styles.optionText}>Soy familia</Text>
        <Text style={styles.optionSub}>Me interesa la salud de mis seres queridos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 20 },
  option: {
    borderWidth: 1, borderColor: '#ccc', padding: 20, borderRadius: 15, marginBottom: 15,
  },
  selected: { borderColor: '#1CB5B9', backgroundColor: '#E0F2F1' },
  optionText: { fontSize: 18, fontWeight: 'bold' },
  optionSub: { fontSize: 14, color: '#666' },
  btn: { backgroundColor: '#1CB5B9', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
