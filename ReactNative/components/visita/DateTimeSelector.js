import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

const DateTimeSelector = ({ 
  fechaProgramada, 
  setShowDatePicker, 
  setShowTimePicker, 
  formatDate, 
  formatTime,
  theme 
}) => {
  return (
    <View style={styles.dateTimeContainer}>
      <MotiView
        from={{ opacity: 0, translateY: 5 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.dateTimeSelectorWrapper}
      >
        <TouchableOpacity 
          style={styles.dateTimeSelector}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dateTimeSelectorGradient}
          >
            <View style={styles.dateTimeIconContainer}>
              <MaterialCommunityIcons name="calendar" size={22} color="#ffffff" />
            </View>
            <View style={styles.dateTimeTextContainer}>
              <Text style={[styles.dateTimeLabelText, { 
                fontFamily: theme?.fonts?.medium?.fontFamily,
                fontWeight: 'bold' 
              }]}>
                Fecha
              </Text>
              <Text style={[styles.dateTimeValueText, { fontFamily: theme?.fonts?.medium?.fontFamily }]}
                numberOfLines={1} ellipsizeMode="tail">
                {formatDate(fechaProgramada)}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#2196F3" style={styles.chevronIcon} />
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
      
      <MotiView
        from={{ opacity: 0, translateY: 5 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: 100 }}
        style={styles.dateTimeSelectorWrapper}
      >
        <TouchableOpacity 
          style={styles.dateTimeSelector}
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dateTimeSelectorGradient}
          >
            <View style={styles.dateTimeIconContainer}>
              <MaterialCommunityIcons name="clock-outline" size={22} color="#ffffff" />
            </View>
            <View style={styles.dateTimeTextContainer}>
              <Text style={[styles.dateTimeLabelText, { 
                fontFamily: theme?.fonts?.medium?.fontFamily,
                fontWeight: 'bold' 
              }]}>
                Hora
              </Text>
              <Text style={[styles.dateTimeValueText, { fontFamily: theme?.fonts?.medium?.fontFamily }]}
                numberOfLines={1} ellipsizeMode="tail">
                {formatTime(fechaProgramada)}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#2196F3" style={styles.chevronIcon} />
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dateTimeSelectorWrapper: {
    width: '48%',
  },
  dateTimeSelector: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 2.0,
  },
  dateTimeSelectorGradient: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    height: 80, // Fijamos altura para consistencia
    paddingHorizontal: 16,
  },
  dateTimeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  dateTimeTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dateTimeLabelText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  dateTimeValueText: {
    fontSize: 15,
    color: '#333',
  },
  chevronIcon: {
    opacity: 0.7,
    marginLeft: 8,
  }
});

export default DateTimeSelector;