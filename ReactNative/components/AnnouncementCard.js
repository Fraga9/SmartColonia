import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Surface, Text, Card, FAB, useTheme, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AnnouncementCard from '../components/AnnouncementCard';

const AnunciosScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userColonias, setUserColonias] = useState([]);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Obtener las colonias a las que pertenece el usuario
  const fetchUserColonias = async () => {
    try {
      // 1. Obtener residencias del usuario
      const { data: residenciasUsuario, error: errorResidencias } = await supabase
        .from('residencias_usuarios')
        .select('residencia_id')
        .eq('usuario_id', user.id);

      if (errorResidencias) throw errorResidencias;
      
      if (!residenciasUsuario.length) {
        setUserColonias([]);
        return [];
      }

      // 2. Obtener colonias de esas residencias
      const residenciaIds = residenciasUsuario.map(ru => ru.residencia_id);
      
      const { data: residencias, error: errorColonias } = await supabase
        .from('residencias')
        .select('colonia_id')
        .in('id', residenciaIds);
        
      if (errorColonias) throw errorColonias;
      
      // Eliminar duplicados
      const coloniaIds = [...new Set(residencias.map(r => r.colonia_id))];
      setUserColonias(coloniaIds);
      return coloniaIds;
      
    } catch (error) {
      console.error('Error al obtener colonias del usuario:', error.message);
      Alert.alert('Error', 'No se pudieron obtener tus colonias.');
      return [];
    }
  };

  // Obtener anuncios
  const fetchAnuncios = async () => {
    setLoading(true);
    try {
      const coloniaIds = await fetchUserColonias();
      
      if (!coloniaIds.length) {
        setAnuncios([]);
        return;
      }
      
      // Obtener anuncios de esas colonias que no hayan expirado
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .in('colonia_id', coloniaIds)
        .or(`fecha_expiracion.is.null,fecha_expiracion.gt.${now}`)
        .order('importante', { ascending: false })
        .order('fecha_publicacion', { ascending: false });
        
      if (error) throw error;
      
      setAnuncios(data || []);
    } catch (error) {
      console.error('Error al obtener anuncios:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los anuncios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar datos
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnuncios();
  }, []);

  // Cargar datos al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchAnuncios();
      return () => {};
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando anuncios...</Text>
          </View>
        ) : anuncios.length > 0 ? (
          <AnnouncementCard 
            announcements={anuncios.map(anuncio => ({
              id: anuncio.id,
              title: anuncio.titulo,
              description: anuncio.contenido,
              created_at: anuncio.fecha_publicacion,
              important: anuncio.importante
            }))} 
            formatDate={formatDate} 
          />
        ) : (
          <Surface style={styles.emptyContainer} elevation={1}>
            <MaterialCommunityIcons 
              name="information-outline" 
              size={48} 
              color={theme.colors.primary} 
            />
            <Text style={styles.emptyText}>
              No hay anuncios disponibles para mostrar.
            </Text>
          </Surface>
        )}
      </ScrollView>
      
      {/* Solo mostrar FAB si el usuario tiene permiso para crear anuncios */}
      {userColonias.length > 0 && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          onPress={() => navigation.navigate('CrearAnuncio', { colonias: userColonias })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default AnunciosScreen;