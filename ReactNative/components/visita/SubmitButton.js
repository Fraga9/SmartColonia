import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

const SubmitButton = ({ onPress, isLoading, theme }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: 300 }}
      style={styles.submitButtonContainer}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        disabled={isLoading}
        style={styles.submitTouchable}
      >
        <LinearGradient
          colors={['#2196F3', '#1976D2', '#0D47A1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.submitGradient}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>Procesando...</Text>
            </View>
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle-outline" size={24} color="#fff" style={styles.leftIcon} />
              <Text style={[styles.submitButtonText, { fontFamily: theme?.fonts?.medium?.fontFamily }]}>
                Registrar Visita
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Shadow effect for iOS */}
      <View style={styles.shadowElement} />
    </MotiView>
  );
};

const styles = StyleSheet.create({
  submitButtonContainer: {
    marginTop: 24,
    marginBottom: 10,
    position: 'relative',
  },
  submitTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    textAlign: 'center',
    flex: 1,
  },
  leftIcon: {
    marginRight: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  shadowElement: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    shadowColor: "#1565C0",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    zIndex: -1,
  }
});

export default SubmitButton;