import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

const TipoVisitaSelector = ({ tipoVisita, setTipoVisita, theme }) => {
  const options = [
    { value: 'Visita', label: 'Visita personal', icon: 'account-group', description: 'Para invitados y visitas ocasionales' },
    { value: 'Servicio', label: 'Servicio', icon: 'tools', description: 'Entregas, mantenimiento, reparaciones' },
    { value: 'Recurrente', label: 'Recurrente', icon: 'reload', description: 'Familiares, amigos frecuentes' }
  ];

  return (
    <View style={styles.tipoVisitaContainer}>
      {options.map((option) => (
        <MotiView
          key={option.value}
          from={{ opacity: 0.8, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            scale: tipoVisita === option.value ? 1.02 : 1
          }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <TouchableOpacity
            style={[
              styles.tipoVisitaOption,
              tipoVisita === option.value && styles.tipoVisitaOptionSelected
            ]}
            onPress={() => setTipoVisita(option.value)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={tipoVisita === option.value ? 
                ['#2196F3', '#1976D2'] : 
                ['#ffffff', '#f8f8f8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipoVisitaGradient}
            >
              <View style={[
                styles.iconContainer,
                tipoVisita === option.value ? styles.iconContainerSelected : styles.iconContainerUnselected
              ]}>
                <MaterialCommunityIcons 
                  name={option.icon} 
                  size={22} 
                  color={tipoVisita === option.value ? '#fff' : '#2196F3'} 
                />
              </View>
              
              <View style={styles.textContainer}>
                <Text style={[
                  styles.tipoVisitaText,
                  { fontFamily: tipoVisita === option.value ? theme?.fonts?.medium?.fontFamily : theme?.fonts?.regular?.fontFamily },
                  tipoVisita === option.value && styles.tipoVisitaTextSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.tipoVisitaDescription,
                  tipoVisita === option.value && styles.tipoVisitaDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </View>
              
              {tipoVisita === option.value && (
                <View style={styles.checkContainer}>
                  <MaterialCommunityIcons name="check-circle" size={22} color="#ffffff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tipoVisitaContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  tipoVisitaOption: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#bdbdbd",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 2.0,
  },
  tipoVisitaOptionSelected: {
    elevation: 4,
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20, // Slightly more margin to create visual hierarchy
  },
  tipoVisitaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainerUnselected: {
    backgroundColor: '#E3F2FD',
  },
  textContainer: {
    flex: 1,
  },
  tipoVisitaText: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 2,
  },
  tipoVisitaTextSelected: {
    color: '#fff',
  },
  tipoVisitaDescription: {
    fontSize: 12,
    color: '#757575',
  },
  tipoVisitaDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkContainer: {
    marginLeft: 8,
    padding: 4,
  }
});

export default TipoVisitaSelector;