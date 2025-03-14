import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Surface, useTheme, Text as PaperText, Button, FAB } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import AnnouncementCard from '../components/AnnouncementCard';
import PaymentCard from '../components/PaymentCard';
import Actions from '../components/Actions';
import RegistrarColonia from '../components/RegistrarColonia';
import { BlurView } from 'expo-blur';
import { FadeInDown, FadeIn } from 'react-native-reanimated';
import LoadingComponent from '../components/LoadingComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Supabase Client
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = StatusBar.currentHeight + 220;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [tipoUsuarioId, setTipoUsuarioId] = useState(3);
  const [coloniaId, setColoniaId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNotifications, setNewNotifications] = useState(3);
  const [residencias, setResidencias] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const ROLE_NAMES = {
    1: 'Administrador',
    2: 'Vigilante',
    3: 'Vecino'
  };

  // Animated values
  const spinValue = useState(new Animated.Value(0))[0];
  const navBarOpacity = useState(new Animated.Value(1))[0];
  const fabScale = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Rotation animation for loading icon
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
    
    // Fade in the FAB after a delay
    Animated.timing(fabScale, {
      toValue: 1,
      duration: 500,
      delay: 800,
      easing: Easing.elastic(1.2),
      useNativeDriver: true
    }).start();
  }, [spinValue, fabScale]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Theme-dependent styles
  const themeStyles = {
    statValue: {
      fontSize: 20,
      fontFamily: theme.fonts.bold.fontFamily, // Usar fontFamily en lugar de fontWeight
      color: theme.colors.primary,
    },
    primaryColorText: {
      color: theme.colors.primary,
    },
    navActiveItem: {
      color: theme.colors.primary,
      fontFamily: theme.fonts.medium.fontFamily, // Añadir fontFamily
    },
    navInactiveItem: {
      color: theme.colors.backdrop,
      fontFamily: theme.fonts.regular.fontFamily, // Añadir fontFamily
    }
  };

  // Fetch user profile information
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user profile from Supabase
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        const getRoleName = (roleId) => {
          return ROLE_NAMES[roleId] || 'Usuario';
        };

        // Set user information
        setUserName(userData.nombre + " " + userData.apellido || 'Usuario');
        setUserRole(getRoleName(userData.tipo_usuario_id));
        setTipoUsuarioId(userData.tipo_usuario_id);
        setColoniaId(userData.colonia_id);

        // If user has a colonia, check if they have residencias
        if (userData.colonia_id) {
          await fetchUserResidencias(user.id);
        }

        // Fetch payments
        fetchPayments(user.id);

      } catch (error) {
        console.error('Error fetching user data:', error.message);
        Alert.alert('Error', 'No se pudo cargar la información del usuario');
        setUserName(user.email ? user.email.split('@')[0] : 'Usuario');
      } finally {
        // Add a small delay to make loading smoother
        setTimeout(() => setLoading(false), 500);
      }
    };

    if (user) fetchUserData();
  }, [user]);

  // Fetch residencias associated with the user
  const fetchUserResidencias = async (userId) => {
    try {
      // Make API call to get user's residencias using Supabase REST API directly
      const response = await fetch(`https://uammxewwluoirsfdvfmu.supabase.co/rest/v1/residencias_usuarios?usuario_id=eq.${userId}&select=residencia_id`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching residencias: ${response.statusText}`);
      }

      const userResidenciasRelations = await response.json();

      // If no residencias, redirect to the claim screen
      if (userResidenciasRelations.length === 0) {
        navigation.navigate('ReclamarResidencia');
        return;
      }

      // Extract residencia IDs
      const residenciaIds = userResidenciasRelations.map(relation => relation.residencia_id);

      // Fetch the actual residencias data
      const residenciasPromises = residenciaIds.map(async (id) => {
        const resResponse = await fetch(`https://uammxewwluoirsfdvfmu.supabase.co/rest/v1/residencias?id=eq.${id}`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI',
            'Content-Type': 'application/json'
          }
        });

        if (!resResponse.ok) {
          throw new Error(`Error fetching residencia details: ${resResponse.statusText}`);
        }

        const residenciaData = await resResponse.json();
        return residenciaData[0]; // Return the first (and should be only) result
      });

      const allResidencias = await Promise.all(residenciasPromises);
      setResidencias(allResidencias);

    } catch (error) {
      console.error('Error fetching user residencias:', error.message);
    }
  };

  // Fetch payment information
  const fetchPayments = async (userId) => {
    try {
      // Mock data for now
      setPayments([
        {
          id: 1,
          concepto: 'Cuota de vigilancia',
          monto: 550,
          fecha_vencimiento: '2025-03-15T00:00:00Z',
          estatus: 'pendiente'
        },
        {
          id: 2,
          concepto: 'Mantenimiento áreas verdes',
          monto: 300,
          fecha_vencimiento: '2025-03-20T00:00:00Z',
          estatus: 'pendiente'
        }
      ]);
    } catch (error) {
      console.error('Error fetching payments:', error.message);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  // Handle scroll events to show/hide navbar
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: navBarOpacity } } }],
    { 
      useNativeDriver: false,
      listener: event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrollPosition(offsetY);
      }
    }
  );

  // Scroll to top function
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (loading) {
    return <LoadingComponent spin={spin} />;
  }

  if (!coloniaId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <RegistrarColonia navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header positioned as a background */}
      <Header
        userName={userName}
        userRole={userRole}
        newNotifications={newNotifications}
        navigation={navigation}
      />

      {/* Main content with offset to account for header */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Background Card */}
        <View style={styles.backgroundCard}>
          {/* Actions Section with animation */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.actionsContainer}
          >
            <Actions navigation={navigation} />
          </Animated.View>

          {/* Announcements Section with animation */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
          >
            <AnnouncementCard coloniaId={coloniaId} />
          </Animated.View>
        </View>

        {/* Bottom Navigation Spacer */}
        <View style={[styles.bottomNavSpacer, { height: 70 + insets.bottom }]} />
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View style={[
        styles.fabContainer,
        { 
          transform: [{ scale: fabScale }],
          bottom: 80 + insets.bottom
        }
      ]}>
        <FAB
          icon="plus"
          theme={{ colors: { surfaceVariant: '#2196F3', onSurfaceVariant: 'white' } }}
          style={styles.fab}
          onPress={() => {
            // Show action sheet or navigate to a "create new" screen
            Alert.alert("Crear nuevo", "¿Qué deseas crear?", [
              { text: "Visita", onPress: () => navigation.navigate('CrearVisitaScreen') },
              { text: "Reporte", onPress: () => navigation.navigate('CrearReporteScreen') },
              { text: "Cancelar", style: "cancel" }
            ]);
          }}
        />
      </Animated.View>

      {/* Scroll to top button - shows when scrolled down */}
      {scrollPosition > HEADER_HEIGHT && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={[styles.scrollTopButton, { bottom: 140 + insets.bottom }]}
        >
          <FAB
            small
            icon="chevron-up"
            style={styles.scrollTopFab}
            onPress={scrollToTop}
          />
        </Animated.View>
      )}

      {/* Bottom Navigation */}
      <Surface 
        style={[
          styles.bottomNav, 
          { paddingBottom: insets.bottom, height: 70 + insets.bottom }
        ]} 
        elevation={8}
      >
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {}}
        >
          <View style={styles.navItemContent}>
            <MaterialCommunityIcons 
              name="home" 
              size={24} 
              color={theme.colors.primary} 
            />
            <PaperText style={[styles.navText, themeStyles.primaryColorText, { fontFamily: theme.fonts.medium.fontFamily }]}>
              Inicio
            </PaperText>
          </View>
          <View style={styles.navItemIndicator} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('VisitasScreen')}
        >
          <View style={styles.navItemContent}>
            <MaterialCommunityIcons 
              name="account-group-outline" 
              size={24} 
              color={theme.colors.backdrop} 
            />
            <PaperText style={[styles.navText, { fontFamily: theme.fonts.regular.fontFamily }]}>
              Visitas
            </PaperText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('QRGeneratorScreen')}
        >
          <View style={styles.navItemContent}>
            <MaterialCommunityIcons 
              name="qrcode" 
              size={24} 
              color={theme.colors.backdrop} 
            />
            <PaperText style={[styles.navText, { fontFamily: theme.fonts.regular.fontFamily }]}>
              QR
            </PaperText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <View style={styles.navItemContent}>
            <MaterialCommunityIcons 
              name="account-circle-outline" 
              size={24} 
              color={theme.colors.backdrop} 
            />
            <PaperText style={[styles.navText, { fontFamily: theme.fonts.regular.fontFamily }]}>
              Perfil
            </PaperText>
          </View>
        </TouchableOpacity>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT - 40, // Offset to allow card to overlap header
  },
  backgroundCard: {
    marginTop: -30, // Adjust as needed to overlap the header
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  bottomNavSpacer: {
    height: 70, // Will be adjusted with insets.bottom
  },
  // Improved bottom navigation with active indicator and better spacing
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1000, // Ensure it stays on top
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 5,
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#999',
  },
  navItemIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 3,
    backgroundColor: '#2196F3', // Cambiado de '#4F46E5' al color primario del tema
    borderRadius: 3,
  },
  // FAB styles
  fabContainer: {
    position: 'absolute',
    right: 24,
    zIndex: 100,
  },
  fab: {
    backgroundColor: '#2196F3', 
  },
  // Scroll to top button
  scrollTopButton: {
    position: 'absolute',
    right: 24,
    zIndex: 100,
  },
  scrollTopFab: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

export default HomeScreen;