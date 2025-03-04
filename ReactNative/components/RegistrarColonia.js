import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text as PaperText, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RegistrarColonia = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="home-city-outline" 
        size={100} 
        color={theme.colors.primary} 
        style={styles.icon}
      />
      
      <PaperText style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily, color: theme.colors.primary }]}>
        Bienvenido a SmartColonia
      </PaperText>
      
      <PaperText style={[styles.description, { fontFamily: theme.fonts.regular.fontFamily }]}>
        Para comenzar a utilizar la aplicación, necesitas registrarte en una colonia o crear una nueva.
      </PaperText>
      
      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          icon="home-plus"
          onPress={() => navigation.navigate('CrearColoniaScreen')}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontFamily: theme.fonts.medium.fontFamily }}
        >
          Crear Colonia
        </Button>
        
        <Button
          mode="outlined"
          icon="home-search"
          onPress={() => navigation.navigate('BuscarColoniaScreen')}
          style={styles.button}
          labelStyle={{ fontFamily: theme.fonts.medium.fontFamily, color: theme.colors.primary }}
        >
          Buscar Colonia
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 6,
  },
});

export default RegistrarColonia;