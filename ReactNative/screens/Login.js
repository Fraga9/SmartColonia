import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { signIn } = useAuth();
  
  // Estado
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Manejadores
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa tu email y contraseña');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      // Usar el método signIn del contexto de autenticación
      const { user, error } = await signIn(email, password);
    
      if (error) {
        setError(error === 'Invalid login credentials' 
          ? 'Email o contraseña incorrectos' 
          : error);
        console.error('Error en login:', error);
      } else {
        console.log('Login exitoso:', user.email);
        // No necesitamos navegar manualmente, el contexto 
        // de autenticación ya actualizará el estado
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Intenta nuevamente.');
      console.error('Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="home-city" size={80} color={theme.colors.primary} />
          <Text style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily }]}>SmartColonia</Text>
          <Text style={[styles.subtitle, { fontFamily: theme.fonts.regular.fontFamily }]}>Gestión inteligente de colonias</Text>
        </View>

        <Surface style={styles.formContainer} elevation={2}>
          <Text style={[styles.formTitle, { fontFamily: theme.fonts.bold.fontFamily }]}>Iniciar Sesión</Text>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!passwordVisible}
            right={
              <TextInput.Icon 
                icon={passwordVisible ? "eye-off" : "eye"} 
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
            left={<TextInput.Icon icon="lock" />}
          />

          {error ? <Text style={[styles.error, { fontFamily: theme.fonts.regular.fontFamily }]}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={[styles.buttonLabel, { fontFamily: theme.fonts.medium.fontFamily }]}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, { fontFamily: theme.fonts.regular.fontFamily }]}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            onPress={handleSignUpRedirect}
            style={styles.signupButton}
            labelStyle={{ fontFamily: theme.fonts.medium.fontFamily }}
          >
            ¿No tienes cuenta? Regístrate
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  formTitle: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
  },
  signupButton: {
    marginTop: 5,
  },
});

export default Login;