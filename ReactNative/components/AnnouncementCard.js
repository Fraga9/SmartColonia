<script src="http://192.168.1.73:8097"></script>
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Surface, Card, Text as PaperText, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const AnnouncementCard = ({ coloniaId }) => {
  const theme = useTheme();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Agregar un log cuando la prop coloniaId cambia
  useEffect(() => {
    // DevTools debugging point
    console.log('[AnuncementCard] coloniaId recibido:', coloniaId);
  }, [coloniaId]);

  useEffect(() => {
    const fetchAnuncios = async () => {
      if (!coloniaId) {
        console.log('[AnuncementCard] coloniaId no definido, omitiendo fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('[AnuncementCard] Iniciando petición para colonia:', coloniaId);
        setLoading(true);
        
        // Agregar una marca de tiempo para medir cuánto tarda la petición
        const startTime = new Date().getTime();
        
        // Usar una URL específica para API de Supabase o tu backend
        const response = await axios.get(`https://uammxewwluoirsfdvfmu.supabase.co/rest/v1/anuncios?colonia_id=eq.${coloniaId}`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI',
            'Content-Type': 'application/json'
          }
        });
        
        const endTime = new Date().getTime();
        
        console.log(`[AnuncementCard] Respuesta recibida en ${endTime - startTime}ms`);
        console.log('[AnuncementCard] Datos recibidos:', response.data);
        
        setAnuncios(response.data);
        setError(null);
        
        // Verificación de datos recibidos
        if (response.data.length === 0) {
          console.log('[AnuncementCard] No se encontraron anuncios para esta colonia');
        } else {
          console.log(`[AnuncementCard] Se encontraron ${response.data.length} anuncios`);
          // Imprimir los títulos para facilitar la inspección
          response.data.forEach((anuncio, index) => {
            console.log(`[AnuncementCard] Anuncio ${index + 1}: ${anuncio.titulo}`);
          });
        }
        
      } catch (err) {
        console.error('[AnuncementCard] Error al obtener anuncios:', err);
        console.error('[AnuncementCard] Mensaje de error:', err.message);
        if (err.response) {
          console.error('[AnuncementCard] Datos de respuesta de error:', err.response.data);
          console.error('[AnuncementCard] Estado de error:', err.response.status);
        }
        setError('No se pudieron cargar los anuncios. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnuncios();
  }, [coloniaId]);

  // Formatea la fecha para mostrar (sin usar date-fns)
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // Opciones para formatear la fecha en español
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      // Usar el API nativo de formateo de fechas
      return date.toLocaleDateString('es-ES', options);
    } catch (e) {
      return dateString;
    }
  };

  // Verifica si un anuncio está próximo a expirar (menos de 3 días)
  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    
    const expiration = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiration - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays > 0 && diffDays < 3;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <PaperText style={{ marginTop: 10, fontFamily: theme.fonts.regular.fontFamily }}>
          Cargando...
        </PaperText>
      </View>
    );
  }

  if (error) {
    return (
      <Surface style={[styles.card, styles.errorCard]} elevation={1}>
        <PaperText style={[styles.errorText, { fontFamily: theme.fonts.medium.fontFamily }]}>
          {error}
        </PaperText>
      </Surface>
    );
  }

  if (anuncios.length === 0) {
    return (
      <Surface style={styles.card} elevation={1}>
        <View style={styles.emptyContainer}>
          <PaperText style={[styles.emptyText, { fontFamily: theme.fonts.regular.fontFamily }]}>
            No hay anuncios disponibles para esta colonia.
          </PaperText>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.card} elevation={1}>
      {anuncios.map((anuncio, index) => (
        <View key={anuncio.id || index} style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="bullhorn-outline" 
              size={24} 
              color={theme.colors.primary} 
            />
            <PaperText style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily, color: theme.colors.primary }]}>
              {anuncio.titulo || "Anuncio"}
            </PaperText>
          </View>
          
          <Card style={styles.contentCard}>
            <Card.Content>
              <PaperText style={[styles.content, { fontFamily: theme.fonts.regular.fontFamily }]}>
                {anuncio.contenido || "Contenido del anuncio"}
              </PaperText>
              
              {anuncio.fecha_publicacion && (
                <PaperText style={[styles.date, { fontFamily: theme.fonts.regular.fontFamily }]}>
                  {formatDate(anuncio.fecha_publicacion)}
                </PaperText>
              )}
            </Card.Content>
          </Card>
        </View>
      ))}
    </Surface>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
  },
  contentCard: {
    marginBottom: 12,
    elevation: 1,
  },
  content: {
    fontSize: 14,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

export default AnnouncementCard;