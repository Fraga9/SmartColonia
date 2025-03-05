import React from 'react';
import { 
  View, 
  Image, 
  SafeAreaView, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { 
  Text, 
  Button, 
  Surface, 
  useTheme 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  const theme = useTheme();

  const styles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroImage: {
      width: width * 0.8,
      height: height * 0.4,
      borderRadius: 20,
      marginBottom: 24,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginTop: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
      gap: 16,
    },
    button: {
      width: width * 0.35,
    },
    iconContainer: {
      flexDirection: 'row', 
      justifyContent: 'center', 
      marginTop: 24,
    },
    featureContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 24,
      paddingHorizontal: 16,
    },
    featureItem: {
      alignItems: 'center',
      width: width * 0.25,
    },
    featureText: {
      marginTop: 8,
      textAlign: 'center',
      fontSize: 12,
      color: theme.colors.secondary,
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Administra tu Comunidad</Text>
          <Text style={styles.subtitle}>
            Simplifica la comunicación y gestión de tu residencia
          </Text>
        </View>

        <Image 
          source={require('../assets/splash-icon.png')} 
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons 
              name="bell-outline" 
              size={36} 
              color={theme.colors.primary} 
            />
            <Text style={styles.featureText}>Notificaciones Instantáneas</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={36} 
              color={theme.colors.primary} 
            />
            <Text style={styles.featureText}>Gestión de Vecinos</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons 
              name="qrcode" 
              size={36} 
              color={theme.colors.primary} 
            />
            <Text style={styles.featureText}>Control de Acceso</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          >
            Iniciar Sesión
          </Button>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('SignUp')}
            style={styles.button}
          >
            Registrarse
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LandingScreen;