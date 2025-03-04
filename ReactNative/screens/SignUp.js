import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { createClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Supabase Client
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

const SignUp = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  // Estado
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Manejadores
  const handleSignUp = async () => {
    // Validación
    if (!email || !password || !confirmPassword || !nombre || !apellido) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Registro con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Crear el registro adicional en tu tabla de usuarios
      if (authData?.user) {
        const { error: userError } = await supabase
          .from('usuarios')
          .insert([
            { 
              id: authData.user.id,
              email, 
              nombre, 
              apellido,
              tipo_usuario_id: 3, // Usuario regular por defecto
              activo: true
            }
          ]);

        if (userError) throw userError;
      }

      // Éxito
      alert('Registro exitoso! Por favor verifica tu email.');
      navigation.navigate('Login');
      
    } catch (error) {
      console.error('Error de registro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="account-plus" size={60} color={theme.colors.primary} />
          <Text style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily }]}>Crear Cuenta</Text>
          <Text style={[styles.subtitle, { fontFamily: theme.fonts.regular.fontFamily }]}>Únete a SmartColonia</Text>
        </View>

        <Surface style={styles.formContainer} elevation={2}>
          <View style={styles.nameContainer}>
            <TextInput
              label="Nombre"
              value={nombre}
              onChangeText={setNombre}
              mode="outlined"
              style={styles.nameInput}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Apellido"
              value={apellido}
              onChangeText={setApellido}
              mode="outlined"
              style={styles.nameInput}
              left={<TextInput.Icon icon="account" />}
            />
          </View>

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

          <TextInput
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!passwordVisible}
            left={<TextInput.Icon icon="lock-check" />}
          />

          {error ? <Text style={[styles.error, { fontFamily: theme.fonts.regular.fontFamily }]}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={[styles.buttonLabel, { fontFamily: theme.fonts.medium.fontFamily }]}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, { fontFamily: theme.fonts.regular.fontFamily }]}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="text"
            onPress={handleLoginRedirect}
            style={styles.loginButton}
            labelStyle={{ fontFamily: theme.fonts.medium.fontFamily }}
          >
            ¿Ya tienes cuenta? Inicia sesión
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
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 0.48,
    marginBottom: 16,
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
  loginButton: {
    marginTop: 5,
  },
});

export default SignUp;