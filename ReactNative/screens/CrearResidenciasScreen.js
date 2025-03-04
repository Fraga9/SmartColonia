import React, { useState, useEffect } from 'react';
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
  IconButton,
  Checkbox,
  Divider,
  SegmentedButtons,
  HelperText
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Supabase Client
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

const CrearResidenciasScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { coloniaId } = route.params || {};

  // Estados para creación de una sola residencia
  const [numero, setNumero] = useState('');
  const [calle, setCalle] = useState('');
  const [referencia, setReferencia] = useState('');
  
  // Estados para creación masiva
  const [modo, setModo] = useState('individual');
  const [prefijoCalle, setPrefijoCalle] = useState('');
  const [rangoInicio, setRangoInicio] = useState('');
  const [rangoFin, setRangoFin] = useState('');
  const [generarLista, setGenerarLista] = useState(false);
  const [residenciasGeneradas, setResidenciasGeneradas] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [coloniaInfo, setColoniaInfo] = useState(null);

  // Obtener información de la colonia
  useEffect(() => {
    const fetchColoniaInfo = async () => {
      if (!coloniaId) {
        navigation.goBack();
        return;
      }

      try {
        const { data, error } = await supabase
          .from('colonias')
          .select('*')
          .eq('id', coloniaId)
          .single();

        if (error) throw error;
        setColoniaInfo(data);
      } catch (error) {
        console.error('Error al obtener información de la colonia:', error.message);
        Alert.alert('Error', 'No se pudo obtener información de la colonia seleccionada.');
        navigation.goBack();
      }
    };

    fetchColoniaInfo();
  }, [coloniaId]);

  // Validación de formularios
  const isIndividualFormValid = () => {
    return numero.trim() !== '' && calle.trim() !== '';
  };

  const isMasivoFormValid = () => {
    return prefijoCalle.trim() !== '' && 
           rangoInicio.trim() !== '' && 
           rangoFin.trim() !== '' &&
           !isNaN(parseInt(rangoInicio)) && 
           !isNaN(parseInt(rangoFin)) && 
           parseInt(rangoInicio) <= parseInt(rangoFin);
  };

  // Generar previsualizacion de residencias
  const generarPrevisualizacion = () => {
    if (!isMasivoFormValid()) {
      Alert.alert('Error', 'Por favor complete correctamente los campos del rango.');
      return;
    }

    const inicio = parseInt(rangoInicio);
    const fin = parseInt(rangoFin);
    
    if (fin - inicio > 100) {
      Alert.alert('Advertencia', 'El rango es muy amplio. Considera crear rangos más pequeños.');
      return;
    }

    const lista = [];
    for (let i = inicio; i <= fin; i++) {
      lista.push({
        numero: i.toString(),
        calle: prefijoCalle.trim(),
        referencia: '',
      });
    }

    setResidenciasGeneradas(lista);
    setGenerarLista(true);
  };

  // Crear residencia individual
  const crearResidenciaIndividual = async () => {
    if (!isIndividualFormValid()) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
      return;
    }

    setLoading(true);

    try {
      // Datos de residencia
      const residenciaData = {
        numero: numero.trim(),
        calle: calle.trim(),
        referencia: referencia.trim(),
        colonia_id: coloniaId
      };

      // Crear residencia
      const { data, error } = await supabase
        .from('residencias')
        .insert(residenciaData)
        .select()
        .single();

      if (error) throw error;

      // Asociar usuario a residencia (Admin)
      const relacion = {
        usuario_id: user.id,
        residencia_id: data.id,
        rol: 'administrador',
        es_principal: true,
        verificado: true
      };

      const { error: relacionError } = await supabase
        .from('residencias_usuarios')
        .insert(relacion);

      if (relacionError) throw relacionError;

      Alert.alert(
        'Éxito', 
        `Residencia creada correctamente.\n\nCódigo de la residencia:\n${data.id}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error al crear residencia:', error.message);
      Alert.alert('Error', 'No se pudo crear la residencia. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Crear residencias masivamente
  const crearResidenciasMasivas = async () => {
    if (!generarLista || residenciasGeneradas.length === 0) {
      Alert.alert('Error', 'Primero debe generar la lista de residencias.');
      return;
    }

    setLoading(true);

    try {
      const residenciasData = residenciasGeneradas.map(item => ({
        numero: item.numero,
        calle: item.calle,
        referencia: '',
        colonia_id: coloniaId
      }));

      // Crear residencias masivamente
      const { data, error } = await supabase
        .from('residencias')
        .insert(residenciasData)
        .select();

      if (error) throw error;

      // Crear relaciones para el administrador
      const relaciones = data.map(residencia => ({
        usuario_id: user.id,
        residencia_id: residencia.id,
        rol: 'administrador',
        es_principal: true,
        verificado: true
      }));

      const { error: relacionesError } = await supabase
        .from('residencias_usuarios')
        .insert(relaciones);

      if (relacionesError) throw relacionesError;

      Alert.alert(
        'Éxito', 
        `${data.length} residencias creadas correctamente.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error al crear residencias:', error.message);
      Alert.alert('Error', 'No se pudieron crear las residencias. Intente nuevamente.');
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
            Crear residencias
          </PaperText>
        </View>
        
        <PaperText style={[styles.subtitle, { fontFamily: theme.fonts.regular.fontFamily, textAlign: 'center' }]}>
          {coloniaInfo ? `Colonia: ${coloniaInfo.nombre}` : 'Cargando información...'}
        </PaperText>

        {/* Selector de modo */}
        <Surface style={styles.formContainer} elevation={1}>
          <PaperText style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>
            Modo de creación
          </PaperText>
          
          <SegmentedButtons
            value={modo}
            onValueChange={setModo}
            buttons={[
              { value: 'individual', label: 'Individual' },
              { value: 'masivo', label: 'Masivo' }
            ]}
            style={styles.segmentedButtons}
          />
        </Surface>
        
        {/* Formulario Individual */}
        {modo === 'individual' && (
          <Surface style={styles.formContainer} elevation={1}>
            <PaperText style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>
              Datos de la residencia
            </PaperText>
            
            {/* Número */}
            <View style={styles.inputGroup}>
              <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
                Número*
              </PaperText>
              <TextInput
                mode="outlined"
                value={numero}
                onChangeText={setNumero}
                placeholder="Ej. 123"
                style={styles.input}
                keyboardType="default"
                error={numero.trim() === ''}
              />
              <HelperText type="error" visible={numero.trim() === ''}>
                Este campo es obligatorio
              </HelperText>
            </View>
            
            {/* Calle */}
            <View style={styles.inputGroup}>
              <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
                Calle*
              </PaperText>
              <TextInput
                mode="outlined"
                value={calle}
                onChangeText={setCalle}
                placeholder="Ej. Calle Principal"
                style={styles.input}
                autoCapitalize="words"
                error={calle.trim() === ''}
              />
              <HelperText type="error" visible={calle.trim() === ''}>
                Este campo es obligatorio
              </HelperText>
            </View>
            
            {/* Referencia */}
            <View style={styles.inputGroup}>
              <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
                Referencia (opcional)
              </PaperText>
              <TextInput
                mode="outlined"
                value={referencia}
                onChangeText={setReferencia}
                placeholder="Ej. Casa color azul, esquina"
                style={styles.input}
                autoCapitalize="sentences"
              />
            </View>
          </Surface>
        )}

        {/* Formulario Masivo */}
        {modo === 'masivo' && (
          <Surface style={styles.formContainer} elevation={1}>
            <PaperText style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>
              Generar múltiples residencias
            </PaperText>
            
            {/* Prefijo de Calle */}
            <View style={styles.inputGroup}>
              <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
                Nombre de la calle*
              </PaperText>
              <TextInput
                mode="outlined"
                value={prefijoCalle}
                onChangeText={setPrefijoCalle}
                placeholder="Ej. Calle Roble"
                style={styles.input}
                autoCapitalize="words"
                error={prefijoCalle.trim() === ''}
              />
              <HelperText type="error" visible={prefijoCalle.trim() === ''}>
                Este campo es obligatorio
              </HelperText>
            </View>
            
            {/* Rango de números */}
            <View style={styles.rangeContainer}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
                  Desde*
                </PaperText>
                <TextInput
                  mode="outlined"
                  value={rangoInicio}
                  onChangeText={setRangoInicio}
                  placeholder="Ej. 1"
                  style={styles.input}
                  keyboardType="numeric"
                  error={rangoInicio.trim() === '' || isNaN(parseInt(rangoInicio))}
                />
              </View>
              
              <View style={[styles.inputGroup, styles.halfInput]}>
                <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
                  Hasta*
                </PaperText>
                <TextInput
                  mode="outlined"
                  value={rangoFin}
                  onChangeText={setRangoFin}
                  placeholder="Ej. 50"
                  style={styles.input}
                  keyboardType="numeric"
                  error={rangoFin.trim() === '' || isNaN(parseInt(rangoFin))}
                />
              </View>
            </View>
            
            <HelperText 
              type="error" 
              visible={rangoInicio.trim() !== '' && rangoFin.trim() !== '' && 
                       (!isNaN(parseInt(rangoInicio)) && !isNaN(parseInt(rangoFin)) && 
                        parseInt(rangoInicio) > parseInt(rangoFin))}
            >
              El valor 'Desde' debe ser menor o igual que 'Hasta'
            </HelperText>
            
            <Button
              mode="outlined"
              onPress={generarPrevisualizacion}
              style={styles.previewButton}
              disabled={!isMasivoFormValid()}
            >
              Generar vista previa
            </Button>
            
            {generarLista && residenciasGeneradas.length > 0 && (
              <View style={styles.previewContainer}>
                <PaperText style={[styles.previewTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>
                  Vista previa ({residenciasGeneradas.length} residencias)
                </PaperText>
                <Surface style={styles.previewList}>
                  {residenciasGeneradas.slice(0, 5).map((item, index) => (
                    <PaperText key={index} style={styles.previewItem}>
                      {item.calle} #{item.numero}
                    </PaperText>
                  ))}
                  {residenciasGeneradas.length > 5 && (
                    <PaperText style={styles.previewMore}>
                      ... y {residenciasGeneradas.length - 5} más
                    </PaperText>
                  )}
                </Surface>
              </View>
            )}
          </Surface>
        )}

        {/* Información para el administrador */}
        <Surface style={styles.infoCard}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={24} 
            color={theme.colors.primary} 
            style={styles.infoIcon}
          />
          <View style={styles.infoTextContainer}>
            <PaperText style={[styles.infoTitle, { color: theme.colors.primary, fontFamily: theme.fonts.medium.fontFamily }]}>
              Información importante
            </PaperText>
            <PaperText style={styles.infoText}>
              Las residencias creadas tendrán un identificador único (UUID) que podrás compartir con los residentes para que puedan vincularse a su domicilio.
            </PaperText>
          </View>
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
            onPress={modo === 'individual' ? crearResidenciaIndividual : crearResidenciasMasivas}
            style={styles.submitButton}
            loading={loading}
            disabled={loading || (modo === 'individual' ? !isIndividualFormValid() : (!generarLista || residenciasGeneradas.length === 0))}
          >
            {modo === 'individual' ? 'Crear residencia' : 'Crear residencias'}
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
  title: {
    fontSize: 24,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 16,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  previewButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  previewContainer: {
    marginTop: 5,
  },
  previewTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  previewList: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  previewItem: {
    fontSize: 14,
    marginBottom: 5,
    color: '#444',
  },
  previewMore: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 5,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(87, 97, 78, 0.2)',
    marginBottom: 25,
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

export default CrearResidenciasScreen;