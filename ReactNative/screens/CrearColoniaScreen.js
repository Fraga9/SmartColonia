import React, { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { 
  Text as PaperText, 
  TextInput, 
  Button, 
  Surface, 
  useTheme, 
  IconButton 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Supabase Client
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

const CrearColoniaScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Comprobar si los campos obligatorios están rellenos
  const isFormValid = () => {
    return nombre.trim() !== '' && direccion.trim() !== '';
  };

  // Función para crear una nueva colonia
  const crearColonia = async () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
      return;
    }

    setLoading(true);

    try {
      // Datos a insertar
      const coloniaData = {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        admin_principal_id: user.id, // Asignar al usuario actual como administrador
      };

      // Crear la colonia en la base de datos
      const { data, error } = await supabase
        .from('colonias')
        .insert(coloniaData)
        .select()
        .single();

      if (error) throw error;

      // Actualizar al usuario para asociarlo con la colonia recién creada
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          colonia_id: data.id,
          tipo_usuario_id: 1 // Asignarle rol de administrador (ajustar según tu esquema)
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      Alert.alert(
        'Éxito', 
        `La colonia "${data.nombre}" ha sido creada correctamente.\n\nTu código de colonia es:\n${data.id}`,
        [
          { 
            text: 'Copiar código', 
            onPress: async () => {
              await Clipboard.setStringAsync(data.id);
              Alert.alert("Copiado", "Código de colonia copiado al portapapeles", [
                { text: 'OK', onPress: () => navigation.navigate('CrearResidenciasScreen', { coloniaId: data.id }) }
              ]);
            } 
          },
          { 
            text: 'Continuar', 
            onPress: () => navigation.navigate('CrearResidenciasScreen', { coloniaId: data.id }) 
          }
        ]
      );
      
    } catch (error) {
      console.error('Error al crear colonia:', error.message);
      Alert.alert('Error', 'No se pudo crear la colonia. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Encabezado */}
        <View style={styles.header}>
          <PaperText style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily, textAlign: 'center' }]}>
            Crear nueva colonia
          </PaperText>
        </View>
        
        <PaperText style={[styles.subtitle, { fontFamily: theme.fonts.regular.fontFamily, textAlign: 'center' }]}>
          Completa los datos para registrar una nueva colonia
        </PaperText>
        
        {/* Formulario */}
        <Surface style={styles.formContainer} elevation={1}>
          {/* Nombre de la colonia */}
          <View style={styles.inputGroup}>
            <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
              Nombre de la colonia*
            </PaperText>
            <TextInput
              mode="outlined"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Residencial Las Flores"
              style={styles.input}
              autoCapitalize="words"
              error={nombre.trim() === ''}
            />
            {nombre.trim() === '' && (
              <PaperText style={styles.errorText}>
                Este campo es obligatorio
              </PaperText>
            )}
          </View>
          
          {/* Dirección */}
          <View style={styles.inputGroup}>
            <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
              Dirección / Ubicación*
            </PaperText>
            <TextInput
              mode="outlined"
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ej. Calle Principal, Ciudad"
              style={styles.input}
              autoCapitalize="words"
              error={direccion.trim() === ''}
            />
            {direccion.trim() === '' && (
              <PaperText style={styles.errorText}>
                Este campo es obligatorio
              </PaperText>
            )}
          </View>

          {/* Información de rol */}
          <Surface style={styles.infoCard}>
            <MaterialCommunityIcons 
              name="account-check" 
              size={24} 
              color={theme.colors.primary} 
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <PaperText style={[styles.infoTitle, { color: theme.colors.primary, fontFamily: theme.fonts.medium.fontFamily }]}>
                Serás el administrador
              </PaperText>
              <PaperText style={styles.infoText}>
                Al crear la colonia, automáticamente se te asignará como administrador principal.
                Podrás invitar a vecinos compartiendo el código de la colonia.
              </PaperText>
            </View>
          </Surface>
        </Surface>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={crearColonia}
            style={styles.submitButton}
            loading={loading}
            disabled={loading || !isFormValid()}
          >
            Crear colonia
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(87, 97, 78, 0.2)',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 8,
  },
  submitButton: {
    flex: 2,
    borderRadius: 8,
  },
});

export default CrearColoniaScreen;