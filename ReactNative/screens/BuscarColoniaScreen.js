import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { 
  Text as PaperText, 
  Button, 
  TextInput, 
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

const BuscarColoniaScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [coloniaCode, setColoniaCode] = useState('');
  const [coloniaInfo, setColoniaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  // Buscar información de la colonia por ID
  const searchColonia = async (code) => {
    setLoading(true);
    setColoniaInfo(null);
  
    try {
      // Ya no necesitamos convertir a entero si es un UUID
      if (!code || code.trim() === '') {
        Alert.alert('Error', 'Por favor ingrese un código válido.');
        setLoading(false);
        return;
      }
  
      // Buscar la colonia en la base de datos
      const { data, error } = await supabase
        .from('colonias')
        .select('*')
        .eq('id', code.trim())
        .single();
  
      if (error) throw error;
  
      if (data) {
        setColoniaInfo(data);
      } else {
        Alert.alert('No encontrada', 'No se encontró ninguna colonia con ese código.');
      }
    } catch (error) {
      console.error('Error buscando colonia:', error.message);
      Alert.alert('Error', 'No se pudo buscar la colonia. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Unirse a la colonia
  const joinColonia = async () => {
    if (!coloniaInfo) return;
    
    setJoinLoading(true);
    try {
      // Actualizar el perfil del usuario con el ID de la colonia
      const { error } = await supabase
        .from('usuarios')
        .update({ colonia_id: coloniaInfo.id })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert(
        'Éxito', 
        `Te has unido a la colonia ${coloniaInfo.nombre}`,
        [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen') }]
      );
    } catch (error) {
      console.error('Error al unirse a la colonia:', error.message);
      Alert.alert('Error', 'No se pudo completar el registro en la colonia.');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <PaperText style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily }]}>
        Buscar Colonia
      </PaperText>

      <PaperText style={[styles.subtitle, { fontFamily: theme.fonts.regular.fontFamily }]}>
        Únete a una colonia ingresando el código de identificación
      </PaperText>

      <View style={styles.optionsContainer}>
        <Surface style={styles.inputContainer} elevation={1}>
          <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
            Ingresa el código de la colonia
          </PaperText>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ej. 8e636417-b01f-45c2..."
              value={coloniaCode}
              onChangeText={setColoniaCode}
              mode="outlined"
              autoCapitalize="none"
            />
            <Button 
              mode="contained"
              onPress={() => searchColonia(coloniaCode)}
              style={styles.searchButton}
              loading={loading}
              disabled={loading || !coloniaCode}
            >
              Buscar
            </Button>
          </View>
        </Surface>

        <Surface style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
          </View>
          <PaperText style={styles.infoText}>
          El código de colonia es un identificador único proporcionado por el administrador de la colonia o que aparece en la invitación que recibiste. Es una secuencia larga de caracteres y números.
          </PaperText>
        </Surface>
      </View>

      {coloniaInfo && (
        <Surface style={styles.coloniaInfoContainer} elevation={2}>
          <PaperText style={[styles.coloniaTitle, { fontFamily: theme.fonts.bold.fontFamily }]}>
            {coloniaInfo.nombre}
          </PaperText>
          
          <View style={styles.coloniaInfoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <PaperText style={styles.coloniaInfoText}>
              {coloniaInfo.direccion || 'Dirección no especificada'}
            </PaperText>
          </View>
          
          <View style={styles.coloniaInfoRow}>
            <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
            <PaperText style={styles.coloniaInfoText}>
              {coloniaInfo.admin_principal_id ? 'Administrada por un vecino' : 'Sin administrador asignado'}
            </PaperText>
          </View>

          <View style={styles.divider}></View>
          
          <PaperText style={styles.noticeText}>
            Al unirte a esta colonia tendrás acceso a toda la información compartida
            por los vecinos y podrás participar en las actividades comunitarias.
          </PaperText>
      
          <Button
            mode="contained"
            onPress={joinColonia}
            style={styles.joinButton}
            labelStyle={styles.joinButtonLabel}
            loading={joinLoading}
            disabled={joinLoading}
          >
            Unirme a esta colonia
          </Button>
        </Surface>
      )}

      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        Regresar
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 12,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    borderRadius: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(87, 97, 78, 0.2)',
  },
  infoIconContainer: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  coloniaInfoContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  coloniaTitle: {
    fontSize: 22,
    marginBottom: 16,
  },
  coloniaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coloniaInfoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
    width: '100%',
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  joinButton: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 6,
  },
  joinButtonLabel: {
    fontSize: 16,
  },
  backButton: {
    borderRadius: 8,
    marginTop: 10,
  }
});

export default BuscarColoniaScreen;