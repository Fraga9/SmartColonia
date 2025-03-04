import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert
} from 'react-native';
import { 
  Text as PaperText, 
  Button, 
  TextInput, 
  Surface, 
  useTheme 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

// Configuración base de Supabase (solo para búsqueda inicial)
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

// Configuración de la API (reemplazar con tu URL base)
const API_BASE_URL = 'http://10.22.147.164:8000';

const ReclamarResidencia = ({ navigation }) => {
  const theme = useTheme();
  const { user, authToken } = useAuth(); 
  const [residenciaId, setResidenciaId] = useState('');
  const [residenciaInfo, setResidenciaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [coloniaUsuario, setColoniaUsuario] = useState(null);
  const [tipoUsuarioId, setTipoUsuarioId] = useState(null);
  const [residenciaTieneRegistros, setResidenciaTieneRegistros] = useState(false);

  // Obtener colonia y tipo de usuario al cargar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user profile from Supabase
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('colonia_id, tipo_usuario_id')
          .eq('id', user.id)
          .single();
        
        if (userError) throw userError;
        
        if (userData && userData.colonia_id) {
          setColoniaUsuario(userData.colonia_id);
          setTipoUsuarioId(userData.tipo_usuario_id);
          console.log("[ReclamarResidencia.js] Tipo de usuario:", userData.tipo_usuario_id);
        } else {
          Alert.alert(
            'Error', 
            'No tienes una colonia asignada. Primero debes registrarte en una colonia.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error.message);
        Alert.alert('Error', 'No se pudo obtener la información de tu perfil.');
      }
    };
    
    fetchUserData();
  }, []);

  // Verificar si la residencia ya tiene registros
  const verificarRegistrosExistentes = async (residenciaId) => {
    try {
      // Consultar si la residencia ya tiene usuarios asociados
      const { data, error } = await supabase
        .from('residencias_usuarios')
        .select('*')
        .eq('residencia_id', residenciaId);
      
      if (error) {
        console.error('Error verificando registros existentes:', error);
        return false;
      }
      
      const tieneRegistros = data && data.length > 0;
      console.log(`[ReclamarResidencia.js] Residencia ${residenciaId} tiene ${data?.length || 0} registros asociados`);
      setResidenciaTieneRegistros(tieneRegistros);
      return tieneRegistros;
    } catch (error) {
      console.error('Error al verificar registros existentes:', error);
      return false;
    }
  };

  // Buscar residencia por ID (UUID)
  const searchResidencia = async (id) => {
    setLoading(true);
    setResidenciaInfo(null);
    setResidenciaTieneRegistros(false);
  
    try {
      if (!id || id.trim() === '') {
        Alert.alert('Error', 'Por favor ingrese un ID válido.');
        setLoading(false);
        return;
      }
      
      console.log(`[ReclamarResidencia.js] Buscando residencia con ID: ${id}`);

      // Buscar la residencia en Supabase por ID
      const { data, error } = await supabase
        .from('residencias')
        .select('*')
        .eq('id', id.trim())
        .single();
  
      if (error) {
        console.error('Error Supabase:', error);
        throw new Error('No se encontró ninguna residencia con ese ID');
      }
  
      if (data) {
        console.log('[ReclamarResidencia.js] Residencia encontrada:', data);
        
        // Verificar que la residencia pertenezca a la colonia del usuario
        if (data.colonia_id !== coloniaUsuario) {
          Alert.alert(
            'Error', 
            'Esta residencia no pertenece a tu colonia. Solo puedes reclamar residencias de tu misma colonia.'
          );
          setLoading(false);
          return;
        }
        
        // Verificar si la residencia ya está asociada al usuario
        const verificacionResponse = await fetch(
          `${API_BASE_URL}/residencias/usuarios/${user.id}`, 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!verificacionResponse.ok) {
          throw new Error('Error al verificar residencias del usuario');
        }

        const residenciasUsuario = await verificacionResponse.json();
        console.log('[ReclamarResidencia.js] Residencias del usuario:', residenciasUsuario);
        
        // Verificar si la residencia ya está asociada
        const yaAsociada = residenciasUsuario.some(
          residencia => residencia.id === data.id
        );

        if (yaAsociada) {
          Alert.alert(
            'Residencia Existente', 
            'Ya tienes esta residencia asociada a tu perfil.'
          );
          setLoading(false);
          return;
        }

        // Verificar si la residencia ya tiene registros
        await verificarRegistrosExistentes(data.id);
        
        setResidenciaInfo(data);
      } else {
        Alert.alert('No encontrada', 'No se encontró ninguna residencia con ese ID.');
      }
    } catch (error) {
      console.error('Error buscando residencia:', error.message);
      Alert.alert('Error', error.message || 'No se pudo buscar la residencia.');
    } finally {
      setLoading(false);
    }
  };

  // Reclamar residencia
  const claimResidencia = async () => {
    if (!residenciaInfo) return;
    
    setClaimLoading(true);
    try {
      console.log('Reclamando residencia:', residenciaInfo.id);
      
      // Determinar si es administrador
      const esAdministrador = tipoUsuarioId === 1;
      
      // Preparar datos para el endpoint de asociación
      // Si es administrador, es_principal y verificado son true
      // Si la residencia ya tiene registros, el rol será "Familiar"
      const claimData = {
        usuario_id: user.id,
        residencia_id: residenciaInfo.id,
        rol: esAdministrador ? "Propietario" : (residenciaTieneRegistros ? "Familiar" : "Propietario"),
        es_principal: esAdministrador, // true si es administrador
        verificado: esAdministrador    // Auto-verificado si es administrador
      };

      console.log('[ReclamarResidencia.js] Datos de reclamo:', claimData);
      console.log('[ReclamarResidencia.js] Es administrador:', esAdministrador ? 'SÍ' : 'NO');
      console.log('[ReclamarResidencia.js] Residencia tiene registros:', residenciaTieneRegistros ? 'SÍ' : 'NO');

      // Llamar al endpoint de asociación de usuario-residencia
      const response = await fetch(`${API_BASE_URL}/residencias/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(claimData)
      });

      console.log('Respuesta status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta:', errorText);
        throw new Error(`Error al reclamar residencia: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Respuesta exitosa:', responseData);

      // Mensaje personalizado según el tipo de usuario y si la residencia tiene registros
      let titulo = 'Solicitud Enviada';
      let mensaje = 'Has solicitado asociarte a la residencia. Estado de verificación: Pendiente';
      
      if (esAdministrador) {
        titulo = 'Residencia Registrada';
        mensaje = 'Has reclamado esta residencia y se ha verificado automáticamente por ser administrador.';
      } else if (residenciaTieneRegistros) {
        titulo = 'Solicitud de Familiar Enviada';
        mensaje = 'Esta residencia ya tiene propietario. Te has registrado como familiar en esta residencia. Tu solicitud será revisada por el administrador.';
      }
        
      Alert.alert(
        titulo,
        mensaje,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Error al reclamar residencia:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <PaperText style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily }]}>
        Reclamar Residencia
      </PaperText>

      <PaperText style={[styles.subtitle, { fontFamily: theme.fonts.regular.fontFamily }]}>
        {tipoUsuarioId === 1 
          ? 'Como administrador, puedes reclamar y verificar residencias automáticamente' 
          : 'Reclama tu residencia ingresando su ID único'}
      </PaperText>

      <View style={styles.optionsContainer}>
        <Surface style={styles.inputContainer} elevation={1}>
          <PaperText style={[styles.inputLabel, { fontFamily: theme.fonts.medium.fontFamily }]}>
            Ingresa el ID de tu residencia
          </PaperText>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ej. 123e4567-e89b-12d..."
              placeholderTextColor="#AAAAAA"
              theme={{
                colors: { 
                  placeholder: '#AAAAAA', // Color más claro para el placeholder
                  text: theme.colors.text // Mantener el color de texto normal
                }
              }}
              value={residenciaId}
              onChangeText={setResidenciaId}
              mode="outlined"
              autoCapitalize="none"
            />
            <Button 
              mode="contained"
              onPress={() => searchResidencia(residenciaId)}
              style={styles.searchButton}
              loading={loading}
              disabled={loading || !residenciaId}
            >
              Buscar
            </Button>
          </View>
        </Surface>

        <Surface style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <MaterialCommunityIcons 
              name={tipoUsuarioId === 1 ? "shield-check" : "information-outline"} 
              size={24} 
              color={tipoUsuarioId === 1 ? theme.colors.primary : "#666"} 
            />
          </View>
          <PaperText style={styles.infoText}>
            {tipoUsuarioId === 1 
              ? 'Como administrador, las residencias que reclames serán verificadas automáticamente.'
              : 'El ID de residencia es un identificador único proporcionado por la administración. Solo puedes reclamar residencias que pertenezcan a tu misma colonia.'}
          </PaperText>
        </Surface>
      </View>

      {residenciaInfo && (
        <Surface style={styles.residenciaInfoContainer} elevation={2}>
          <PaperText style={[styles.residenciaTitle, { fontFamily: theme.fonts.bold.fontFamily }]}>
            Residencia Encontrada
          </PaperText>
          
          <View style={styles.residenciaInfoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <PaperText style={styles.residenciaInfoText}>
              {`Calle ${residenciaInfo.calle}, #${residenciaInfo.numero}`}
            </PaperText>
          </View>
          
          <View style={styles.residenciaInfoRow}>
            <MaterialCommunityIcons name="home" size={20} color={theme.colors.primary} />
            <PaperText style={styles.residenciaInfoText}>
              {residenciaInfo.referencia || 'Sin referencia'}
            </PaperText>
          </View>

          {residenciaTieneRegistros && (
            <View style={styles.residenciaInfoRow}>
              <MaterialCommunityIcons name="account-group" size={20} color={theme.colors.secondary} />
              <PaperText style={[styles.residenciaInfoText, {color: theme.colors.secondary}]}>
                Esta residencia ya tiene propietario registrado
              </PaperText>
            </View>
          )}

          <View style={styles.divider}></View>
          
          <PaperText style={styles.noticeText}>
            {tipoUsuarioId === 1 
              ? 'Como administrador, al reclamar esta residencia quedará automáticamente verificada y se te asignará como residencia principal.'
              : residenciaTieneRegistros 
                ? 'Esta residencia ya tiene propietario, te registrarás como familiar. Tu solicitud requerirá aprobación del administrador.'
                : 'Al reclamar esta residencia, enviarás una solicitud al administrador para verificar tu tenencia. La solicitud será revisada y aprobada manualmente.'}
          </PaperText>
      
          <Button
            mode="contained"
            onPress={claimResidencia}
            style={[
              styles.claimButton, 
              tipoUsuarioId === 1 ? { backgroundColor: theme.colors.primary } : 
              residenciaTieneRegistros ? { backgroundColor: theme.colors.secondary } : {}
            ]}
            labelStyle={styles.claimButtonLabel}
            loading={claimLoading}
            disabled={claimLoading}
          >
            {tipoUsuarioId === 1 
              ? 'Registrar Residencia' 
              : residenciaTieneRegistros 
                ? 'Registrarse como Familiar' 
                : 'Solicitar Reclamación'}
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
    fontSize: 14, // Más pequeño para UUIDs
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
  residenciaInfoContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  residenciaTitle: {
    fontSize: 22,
    marginBottom: 16,
  },
  residenciaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  residenciaInfoText: {
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
  claimButton: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 6,
  },
  claimButtonLabel: {
    fontSize: 16,
  },
  backButton: {
    borderRadius: 8,
    marginTop: 10,
  }
});

export default ReclamarResidencia;