import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import {
  Surface,
  useTheme,
  Text,
  TextInput,
  Divider,
  Switch,
  Appbar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView, MotiPressable } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Importing the components you want to keep
import ResidenciaSelector from '../components/visita/ResidenciaSelector';
import TipoVisitaSelector from '../components/visita/TipoVisitaSelector';
import DateTimeSelector from '../components/visita/DateTimeSelector';
import SubmitButton from '../components/visita/SubmitButton';

// Animated components
import Animated, { 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate,
  Extrapolation,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

// Supabase Client
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

// Componente AnimatedScrollView que extiende ScrollView con Animated
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const RegisterVisitScreen = ({ navigation, route }) => {
  const { userId, residencias: residenciasParam = [] } = route.params || {};
  const { user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const formScale = useSharedValue(0.97);

  // Form state
  const [nombreVisitante, setNombreVisitante] = useState('');
  const [apellidoVisitante, setApellidoVisitante] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [tipoVisita, setTipoVisita] = useState('Visita');
  const [fechaProgramada, setFechaProgramada] = useState(new Date());
  const [activa, setActiva] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [residenciaId, setResidenciaId] = useState(null);
  const [residencias, setResidencias] = useState(residenciasParam);
  const [selectedResidencia, setSelectedResidencia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResidenciaOptions, setShowResidenciaOptions] = useState(false);
  
  // Initialize animation values
  useEffect(() => {
    formScale.value = withTiming(1, { duration: 300 });
    
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, []);

  // Scroll event handler with improved physics
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Smooth damping effect for scroll
      scrollY.value = event.contentOffset.y;
      
      // Adjust header opacity with a smoother transition
      headerOpacity.value = interpolate(
        scrollY.value,
        [0, 60],
        [1, 0],
        Extrapolation.CLAMP
      );
    },
  });

  // Animated styles for the header
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  // Animated styles for the appbar
  const appbarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [40, 80],
      [0, 1],
      Extrapolation.CLAMP
    );

    const elevation = interpolate(
      scrollY.value,
      [40, 80],
      [0, 8],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      elevation,
      style: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: elevation/2 },
        shadowOpacity: opacity * 0.2,
        shadowRadius: elevation/2,
      }
    };
  });
  
  // Animated style for the form
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: formScale.value },
      ],
      opacity: interpolate(
        formScale.value,
        [0.97, 1],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  // Use the passed residencias data
  useEffect(() => {
    if (residenciasParam && residenciasParam.length > 0) {
      setResidencias(residenciasParam);

      if (residenciasParam.length === 1) {
        setSelectedResidencia(residenciasParam[0]);
        setResidenciaId(residenciasParam[0].id);
      }
    } else {
      fetchUserResidencias();
    }
  }, [residenciasParam]);

  // Fetch user's residencias
  const fetchUserResidencias = async () => {
    try {
      Alert.alert("No tienes residencias registradas", "Debes reclamar una residencia primero.");
      navigation.navigate('ReclamarResidencia');
    } catch (error) {
      console.error('Error fetching user residencias:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las residencias.');
    }
  };

  // Formatters
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Event handlers
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaProgramada;
    setShowDatePicker(false);
    
    const newDate = new Date(currentDate);
    newDate.setHours(fechaProgramada.getHours(), fechaProgramada.getMinutes());
    
    setFechaProgramada(newDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || fechaProgramada;
    setShowTimePicker(false);
    
    const newDate = new Date(fechaProgramada);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    
    setFechaProgramada(newDate);
  };

  const handleSubmit = async () => {
    if (!nombreVisitante || !apellidoVisitante || !identificacion || !residenciaId) {
      Alert.alert('Campo requerido', 'Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      const visitaData = {
        nombre_visitante: nombreVisitante,
        apellido_visitante: apellidoVisitante,
        identificacion: identificacion,
        tipo: tipoVisita,
        fecha_programada: fechaProgramada.toISOString(),
        residencia_id: residenciaId,
        usuario_id: user.id,
        activa: activa
      };

      const { data: createdVisita, error } = await supabase
        .from('visitas')
        .insert(visitaData)
        .select()
        .single();

      if (error) throw new Error(error.message || 'Error al crear la visita');

      Alert.alert(
        'Visita registrada',
        'La visita se ha registrado correctamente.',
        [
          {
            text: 'Ver QR',
            onPress: () => navigation.navigate('QRVisitaScreen', { visitaId: createdVisita.id })
          },
          {
            text: 'Volver a inicio',
            onPress: () => navigation.navigate('HomeScreen')
          }
        ]
      );
    } catch (error) {
      console.error('Error al crear visita:', error.message);
      Alert.alert('Error', error.message || 'No se pudo crear la visita.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render section titles with consistent styling
  const renderSectionTitle = (title) => (
    <MotiView
      from={{ opacity: 0, translateY: 5 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View style={styles.sectionTitleContainer}>
        <Text style={[
          styles.sectionTitle, 
          { fontFamily: theme.fonts.medium.fontFamily }
        ]}>
          {title}
        </Text>
      </View>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      {/* Adaptative StatusBar */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      
      {/* Persistent AppBar - appears when scrolling */}
      <Animated.View style={appbarAnimatedStyle}>
        <Appbar.Header style={styles.persistentAppbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#2196F3" />
          <Appbar.Content 
            title="Registrar Visita" 
            color="#333"
            titleStyle={styles.appbarTitle} 
          />
        </Appbar.Header>
      </Animated.View>

      {/* Main content */}
      <AnimatedScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { 
            paddingTop: insets.top, 
            paddingBottom: insets.bottom + 20 
          }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated header that disappears */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#2196F3" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontFamily: theme.fonts.titleLarge.fontFamily }]}>Registrar Visita</Text>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="account-plus" size={26} color="#2196F3" />
            </View>
          </View>
        </Animated.View>

        {/* Form card with pleasant animations */}
        <Animated.View style={[formAnimatedStyle]}>
          <View style={styles.formContainer}>
            {/* Residencia Section */}
            {renderSectionTitle("Residencia")}
            <ResidenciaSelector 
              residencias={residencias}
              selectedResidencia={selectedResidencia}
              setSelectedResidencia={setSelectedResidencia}
              setResidenciaId={setResidenciaId}
              showResidenciaOptions={showResidenciaOptions}
              setShowResidenciaOptions={setShowResidenciaOptions}
              theme={theme}
            />
            
            <Divider style={styles.divider} />
            
            {/* Datos del visitante */}
            {renderSectionTitle("Datos del visitante")}
            
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 100 }}
            >
              <View style={styles.inputGroup}>
                <TextInput
                  label="Nombre"
                  value={nombreVisitante}
                  onChangeText={setNombreVisitante}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={theme.colors.surfaceVariant}
                  left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
                />
                
                <TextInput
                  label="Apellido"
                  value={apellidoVisitante}
                  onChangeText={setApellidoVisitante}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={theme.colors.surfaceVariant}
                  left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
                />
                
                <TextInput
                  label="Identificación"
                  value={identificacion}
                  onChangeText={setIdentificacion}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={theme.colors.surfaceVariant}
                  left={<TextInput.Icon icon="card-account-details" color={theme.colors.primary} />}
                  placeholder="Número de identificación, licencia, etc."
                />
              </View>
            </MotiView>
            
            <Divider style={styles.divider} />
            
            {/* Tipo de visita */}
            {renderSectionTitle("Tipo de visita")}
            
            <TipoVisitaSelector 
              tipoVisita={tipoVisita}
              setTipoVisita={setTipoVisita}
              theme={theme}
            />
            
            <Divider style={styles.divider} />
            
            {/* Fecha y hora */}
            {renderSectionTitle("Fecha y hora programada")}
            
            <DateTimeSelector 
              fechaProgramada={fechaProgramada}
              setShowDatePicker={setShowDatePicker}
              setShowTimePicker={setShowTimePicker}
              formatDate={formatDate}
              formatTime={formatTime}
              theme={theme}
            />
            
            {showDatePicker && (
              <DateTimePicker
                value={fechaProgramada}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={fechaProgramada}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
            
            <Divider style={styles.divider} />
            
            {/* Estado de la visita */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 150 }}
              style={styles.switchSection}
            >
              <Surface style={styles.switchCard}>
                <View style={styles.switchContainer}>
                  <View style={styles.switchTextContainer}>
                    <Text style={[styles.switchLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
                      Activar QR inmediatamente
                    </Text>
                    <Text style={styles.switchDescription}>
                      {activa 
                        ? 'El QR estará activo tras crear la visita' 
                        : 'El QR permanecerá inactivo hasta activación manual'
                      }
                    </Text>
                  </View>
                  <Switch 
                    value={activa} 
                    onValueChange={setActiva} 
                    color={theme.colors.primary}
                  />
                </View>
              </Surface>
            </MotiView>
            
            {/* Botón de registro */}
            <SubmitButton 
              onPress={handleSubmit}
              isLoading={isLoading}
              theme={theme}
            />
          </View>
        </Animated.View>
      </AnimatedScrollView>
    </View>
  );
};

// Updated styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    paddingBottom: 12,
    marginBottom: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  backButton: {
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    flex: 1,
    marginLeft: 8,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  persistentAppbar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  formContainer: {
    paddingVertical: 12,
  },
  sectionTitleContainer: {
    marginBottom: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    letterSpacing: 0.2,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0',
    height: 1,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  switchSection: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  switchDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default RegisterVisitScreen;