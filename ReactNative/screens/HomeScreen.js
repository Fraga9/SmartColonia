import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StatusBar, 
  SafeAreaView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Surface, useTheme, Text as PaperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import AnnouncementCard from '../components/AnnouncementCard';
import PaymentCard from '../components/PaymentCard';
import Actions from '../components/Actions'; 
import RegistrarColonia from '../components/RegistrarColonia';


// Supabase Client
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [tipoUsuarioId, setTipoUsuarioId] = useState(3); 
  const [coloniaId, setColoniaId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNotifications, setNewNotifications] = useState(3);
  const ROLE_NAMES = {
    1: 'Administrador',
    2: 'Vigilante',
    3: 'Vecino'
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
        
        // Fetch announcements
        fetchAnnouncements(userData.colonia_id);
        
        // Fetch payments
        fetchPayments(user.id);
        
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        Alert.alert('Error', 'No se pudo cargar la información del usuario');
        setUserName(user.email.split('@')[0]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchUserData();
  }, [user]);

  // Fetch community announcements
  const fetchAnnouncements = async (coloniaId) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('colonia_id', coloniaId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error.message);
      // Set mock data
      setAnnouncements([
        { 
          id: 1, 
          title: 'Mantenimiento programado', 
          description: 'Corte de agua el día 25 de marzo de 9am a 12pm',
          created_at: '2025-03-01T10:00:00Z'
        },
        {
          id: 2,
          title: 'Asamblea vecinal',
          description: 'Se invita a todos los vecinos a la asamblea del 28 de marzo a las 7pm',
          created_at: '2025-03-02T11:30:00Z'
        }
      ]);
    }
  };

  // Fetch payment information
  const fetchPayments = async (userId) => {
    try {
      // This would be a real API call in production
      // const { data, error } = await supabase
      //   .from('pagos')
      //   .select('*')
      //   .eq('usuario_id', userId)
      //   .order('fecha_vencimiento', { ascending: true })
      //   .limit(3);
      
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


  if (loading)
  {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <PaperText style={{ marginTop: 20 }}>Cargando...</PaperText>
      </SafeAreaView>
    );
  }

  if (!coloniaId){
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
        <RegistrarColonia navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
      
      {/* Header Section */}
      <Header 
        userName={userName} 
        userRole={userRole} 
        newNotifications={newNotifications} 
        navigation={navigation} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Actions Section */}
        <Actions navigation={navigation} />

        {/* Announcements Section */}
        <AnnouncementCard 
          announcements={announcements} 
          formatDate={formatDate} 
        />

        {/* Payment Reminders */}
        <PaymentCard 
          payments={payments} 
          formatDate={formatDate} 
          navigation={navigation} 
        />

        {/* Bottom Navigation Spacer */}
        <View style={styles.bottomNavSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <Surface style={styles.bottomNav} elevation={4}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <MaterialCommunityIcons name="home" size={24} color={theme.colors.primary} />
          <PaperText style={[styles.navText, { color: theme.colors.primary }]}>Inicio</PaperText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('VisitasScreen')}>
          <MaterialCommunityIcons name="account-group-outline" size={24} color="#999" />
          <PaperText style={styles.navText}>Visitas</PaperText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('QRGeneratorScreen')}>
          <MaterialCommunityIcons name="qrcode" size={24} color="#999" />
          <PaperText style={styles.navText}>QR</PaperText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <MaterialCommunityIcons name="account-circle-outline" size={24} color="#999" />
          <PaperText style={styles.navText}>Perfil</PaperText>
        </TouchableOpacity>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bottomNavSpacer: {
    height: 70,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
    color: '#999',
  },
});

export default HomeScreen;