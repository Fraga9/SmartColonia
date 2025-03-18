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
  Button,
  IconButton,
  Divider,
  Checkbox,
  Switch,
  RadioButton,
  Appbar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

import ResidenciaSelector from '../components/visita/ResidenciaSelector';
import TipoVisitaSelector from '../components/visita/TipoVisitaSelector';
import DateTimeSelector from '../components/visita/DateTimeSelector';
import SubmitButton from '../components/visita/SubmitButton';
import Animated, { 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate,
  Extrapolation
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
  const [residencias, setResidencias] = useState(residenciasParam); // Initialize with passed data
  const [selectedResidencia, setSelectedResidencia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResidenciaOptions, setShowResidenciaOptions] = useState(false);

  // Scroll event handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles for the header
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerHeight = interpolate(
      scrollY.value,
      [0, 100],
      [0, -100],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY: headerHeight }],
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  // Animated styles for the appbar (persistent header)
  const appbarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [50, 100],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      elevation: opacity > 0 ? 4 : 0,
    };
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    return () => {
      // Reset when unmounting
      StatusBar.setBarStyle('default');
    };
  }, []);

  // Use the passed residencias data
  useEffect(() => {
    console.log('[Register Visit Screen] Received residencias:', residenciasParam);
    
    if (residenciasParam && residenciasParam.length > 0) {
      setResidencias(residenciasParam);

      // If there's only one residence, select it automatically
      if (residenciasParam.length === 1) {
        setSelectedResidencia(residenciasParam[0]);
        setResidenciaId(residenciasParam[0].id);
        console.log('[Register Visit Screen] Residencia seleccionada automáticamente:', residenciasParam[0]);
      }
    } else {
      // As fallback, keep the fetchUserResidencias function
      console.log('[Register Visit Screen] No se recibieron residencias, ejecutando fetchUserResidencias');
      fetchUserResidencias();
    }
  }, [residenciasParam]); // Add dependency to re-run if residenciasParam changes}

  // Fetch user's residencias
  const fetchUserResidencias = async () => {
    try {
      // Si quieres mantener la lógica de redirección:
      Alert.alert("No tienes residencias registradas", "Debes reclamar una residencia primero.");
      navigation.navigate('ReclamarResidencia');
    } catch (error) {
      console.error('Error fetching user residencias:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las residencias.');
    }
  };

  // Manejadores de eventos
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaProgramada;
    setShowDatePicker(false);
    
    // Preservar la hora actual
    const newDate = new Date(currentDate);
    newDate.setHours(fechaProgramada.getHours(), fechaProgramada.getMinutes());
    
    setFechaProgramada(newDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || fechaProgramada;
    setShowTimePicker(false);
    
    // Preservar la fecha actual
    const newDate = new Date(fechaProgramada);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    
    setFechaProgramada(newDate);
  };

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

  const handleSubmit = async () => {
    if (!nombreVisitante || !apellidoVisitante || !identificacion || !residenciaId) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setIsLoading(true);

    try {
      // Crear objeto de visita
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

      // Usar la API de Supabase para crear la visita
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Persistent AppBar - aparece cuando se hace scroll */}
      <Animated.View style={appbarAnimatedStyle}>
        <Appbar.Header style={styles.persistentAppbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFF" />
          <Appbar.Content title="Registrar Visita" color="#FFF" />
          <Appbar.Action icon="account-plus" color="#FFF" />
        </Appbar.Header>
      </Animated.View>

      {/* Contenido scrollable */}
      <AnimatedScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Encabezado animado que desaparece */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <LinearGradient
            colors={['#2196F3', '#1976D2', '#0D47A1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerGradient, { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }]}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Registrar Visita</Text>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="account-plus" size={32} color="#FFF" />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tarjeta de formulario */}
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={styles.formCard}
        >
          <Surface style={styles.formContainer}>
            {/* Selector de residencia */}
            <Text style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>Residencia</Text>
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
            <Text style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>Datos del visitante</Text>
            
            <TextInput
              label="Nombre"
              value={nombreVisitante}
              onChangeText={setNombreVisitante}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />
            
            <TextInput
              label="Apellido"
              value={apellidoVisitante}
              onChangeText={setApellidoVisitante}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />
            
            <TextInput
              label="Identificación"
              value={identificacion}
              onChangeText={setIdentificacion}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="card-account-details" />}
              placeholder="Número de identificación, licencia, etc."
            />
            
            <Divider style={styles.divider} />
            
            {/* Tipo de visita */}
            <Text style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>Tipo de visita</Text>
            
            <TipoVisitaSelector 
              tipoVisita={tipoVisita}
              setTipoVisita={setTipoVisita}
            />
            
            <Divider style={styles.divider} />
            
            {/* Fecha y hora */}
            <Text style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>Fecha y hora programada</Text>
            
            <DateTimeSelector 
              fechaProgramada={fechaProgramada}
              setShowDatePicker={setShowDatePicker}
              setShowTimePicker={setShowTimePicker}
              formatDate={formatDate}
              formatTime={formatTime}
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
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, { fontFamily: theme.fonts.regular.fontFamily }]}>Activar QR inmediatamente</Text>
              <Switch 
                value={activa} 
                onValueChange={setActiva} 
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.switchDescription, { fontFamily: theme.fonts.regular.fontFamily }]}>
              {activa 
                ? 'El QR estará activo inmediatamente tras crear la visita' 
                : 'El QR permanecerá inactivo hasta que lo actives manualmente'
              }
            </Text>
            
            {/* Botón de registro */}
            <SubmitButton 
              onPress={handleSubmit}
              isLoading={isLoading}
            />
          </Surface>
        </MotiView>
      </AnimatedScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    width: '100%',
    overflow: 'hidden',
  },
headerGradient: {
  paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
  paddingBottom: 20,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
},
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  persistentAppbar: {
    backgroundColor: '#1976D2',  
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  formCard: {
    marginTop: 15,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    marginBottom: 20,
  },
  formContainer: {
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});

export default RegisterVisitScreen;