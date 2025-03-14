import React from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Text as PaperText, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoadingComponent = ({ spin }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, styles.loadingContainer]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons name="home-city" size={60} color={theme.colors.primary} />
      </Animated.View>
      <PaperText style={{ marginTop: 20, fontFamily: theme.fonts.medium.fontFamily, color: theme.colors.primary }}>
        Cargando SmartColonia...
      </PaperText>
      <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 10 }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff', // Match background color
  },
});

export default LoadingComponent;