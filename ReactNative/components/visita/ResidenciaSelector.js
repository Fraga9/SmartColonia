import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

const ResidenciaSelector = ({
  residencias,
  selectedResidencia,
  setSelectedResidencia,
  setResidenciaId,
  showResidenciaOptions,
  setShowResidenciaOptions,
  theme
}) => {
  if (residencias.length === 0) {
    return (
      <Text style={styles.errorText}>No tienes residencias registradas.</Text>
    );
  }

  if (residencias.length === 1) {
    const residencia = residencias[0];
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.selectedResidenciaContainer}
      >
        <LinearGradient
          colors={['#E3F2FD', '#BBDEFB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.residenciaGradient}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="home" size={22} color="#ffffff" />
          </View>
          <Text style={[styles.selectedResidenciaText, { fontFamily: theme.fonts.medium.fontFamily }]}>
            {`${residencia.calle || residencia.direccion || ''} ${residencia.numero || residencia.numero_exterior || ''}`}
            {residencia.referencia ? ` (${residencia.referencia})` : ''}
          </Text>
        </LinearGradient>
      </MotiView>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.residenciaSelectorButton}
        onPress={() => setShowResidenciaOptions(!showResidenciaOptions)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#E3F2FD', '#BBDEFB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.residenciaSelectorGradient}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="home" size={22} color="#ffffff" />
          </View>
          <Text style={[styles.residenciaSelectorButtonText, { fontFamily: theme.fonts.medium.fontFamily }]}>
            {selectedResidencia 
              ? `${selectedResidencia.calle || selectedResidencia.direccion || ''} ${selectedResidencia.numero || selectedResidencia.numero_exterior || ''}` 
              : 'Selecciona una residencia'
            }
          </Text>
          <MaterialCommunityIcons 
            name={showResidenciaOptions ? "chevron-up" : "chevron-down"} 
            size={22} 
            color={theme.colors.primary} 
          />
        </LinearGradient>
      </TouchableOpacity>
      
      {showResidenciaOptions && (
        <MotiView
          from={{ opacity: 0, translateY: -5 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.residenciaOptionsContainer}
        >
          {residencias.map((residencia, index) => (
            <TouchableOpacity
              key={residencia.id}
              style={[
                styles.residenciaOption,
                selectedResidencia?.id === residencia.id && styles.residenciaOptionSelected,
                index === residencias.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => {
                setSelectedResidencia(residencia);
                setResidenciaId(residencia.id);
                setShowResidenciaOptions(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.miniIconContainer,
                selectedResidencia?.id === residencia.id && styles.miniIconContainerSelected
              ]}>
                <MaterialCommunityIcons
                  name="home"
                  size={16}
                  color={selectedResidencia?.id === residencia.id ? "#ffffff" : "#BBDEFB"}
                />
              </View>
              <Text style={[
                styles.residenciaOptionText,
                { fontFamily: theme.fonts.regular.fontFamily },
                selectedResidencia?.id === residencia.id && { 
                  color: theme.colors.primary, 
                  fontFamily: theme.fonts.medium.fontFamily 
                }
              ]}>
                {`${residencia.calle || residencia.direccion || ''} ${residencia.numero || residencia.numero_exterior || ''}`}
                {residencia.referencia ? ` (${residencia.referencia})` : ''}
              </Text>
              {selectedResidencia?.id === residencia.id && (
                <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </MotiView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: '#FF5252',
    marginBottom: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedResidenciaContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    marginBottom: 8,
  },
  residenciaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  miniIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniIconContainerSelected: {
    backgroundColor: '#2196F3',
  },
  selectedResidenciaText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  residenciaSelectorButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  residenciaSelectorGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
  },
  residenciaSelectorButtonText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginLeft: 0,
  },
  residenciaOptionsContainer: {
    marginTop: 8,
    padding: 6,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  residenciaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  residenciaOptionSelected: {
    backgroundColor: '#F5F9FF',
  },
  residenciaOptionText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  }
});

export default ResidenciaSelector;