import React, { useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Import screens
import HomeScreen from './screens/HomeScreen';
import UsersScreen from './screens/UsersScreen';
import ColoniasScreen from './screens/ColoniasScreen';
import ResidenciasScreen from './screens/ResidenciasScreen';
import VisitasScreen from './screens/VisitasScreen';
import Login from './screens/Login';
import LandingScreen from './screens/LandingPage';
import SignUp from './screens/SignUp';
import BuscarColoniaScreen from './screens/BuscarColoniaScreen';
import CrearColoniaScreen from './screens/CrearColoniaScreen';
import CrearResidenciasScreen from './screens/CrearResidenciasScreen';
import ReclamarResidencia from './screens/ReclamarResidencia';
// Import auth context
import { AuthProvider, useAuth } from './context/AuthContext';

// Define tema personalizado
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#f6f6f6',
  },
  fonts: {
    regular: {
      fontFamily: Platform.select({
        android: 'Poppins_400Regular',
        ios: 'Poppins-Regular',
      }),
    },
    medium: {
      fontFamily: Platform.select({
        android: 'Poppins_500Medium',
        ios: 'Poppins-Medium',
      }),
    },
    bold: {
      fontFamily: Platform.select({
        android: 'Poppins_700Bold',
        ios: 'Poppins-Bold',
      }),
    },
    // Add the missing variants that React Native Paper is looking for
    bodySmall: {
      fontFamily: Platform.select({
        android: 'Poppins_400Regular',
        ios: 'Poppins-Regular',
      }),
      fontSize: 12,
    },
    bodyMedium: {
      fontFamily: Platform.select({
        android: 'Poppins_500Medium',
        ios: 'Poppins-Medium',
      }),
      fontSize: 14,
    },
    bodyLarge: {
      fontFamily: Platform.select({
        android: 'Poppins_400Regular',
        ios: 'Poppins-Regular',
      }),
      fontSize: 16,
    },
    labelSmall: {
      fontFamily: Platform.select({
        android: 'Poppins_500Medium',
        ios: 'Poppins-Medium',
      }),
      fontSize: 11,
    },
    labelMedium: {
      fontFamily: Platform.select({
        android: 'Poppins_500Medium',
        ios: 'Poppins-Medium',
      }),
      fontSize: 12,
    },
    labelLarge: {
      fontFamily: Platform.select({
        android: 'Poppins_500Medium',
        ios: 'Poppins-Medium',
      }),
      fontSize: 14,
    },
    titleSmall: {
      fontFamily: Platform.select({
        android: 'Poppins_500Medium',
        ios: 'Poppins-Medium',
      }),
      fontSize: 14,
    },
    titleMedium: {
      fontFamily: Platform.select({
        android: 'Poppins_700Bold',
        ios: 'Poppins-Bold',
      }),
      fontSize: 16,
    },
    titleLarge: {
      fontFamily: Platform.select({
        android: 'Poppins_700Bold',
        ios: 'Poppins-Bold',
      }),
      fontSize: 20,
    },
    headlineSmall: {
      fontFamily: Platform.select({
        android: 'Poppins_700Bold',
        ios: 'Poppins-Bold',
      }),
      fontSize: 24,
    },
    headlineMedium: {
      fontFamily: Platform.select({
        android: 'Poppins_700Bold',
        ios: 'Poppins-Bold',
      }),
      fontSize: 28,
    },
    headlineLarge: {
      fontFamily: Platform.select({
        android: 'Poppins_700Bold',
        ios: 'Poppins-Bold',
      }),
      fontSize: 32,
    },
  },
};

const Stack = createNativeStackNavigator();

// Loading screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2196F3" />
  </View>
);

// Navigation component that depends on auth state
const Navigation = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right' // Optional: adds a slide animation
        }}
      >
        {/* Always show LandingScreen first if not authenticated */}
        {!user && (
          <Stack.Screen 
            name="Landing" 
            component={LandingScreen} 
          />
        )}

        {/* Authentication Routes */}
        {!user && (
          <>
            <Stack.Screen 
              name="Login" 
              component={Login} 
              options={{ 
                // Optional: customize transition if needed
                animation: 'slide_from_right' 
              }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUp} 
              options={{ 
                animation: 'slide_from_right' 
              }}
            />
          </>
        )}

        {/* Protected App Routes */}
        {user && (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="UsersScreen" component={UsersScreen} />
            <Stack.Screen name="ColoniasScreen" component={ColoniasScreen} />
            <Stack.Screen name="ResidenciasScreen" component={ResidenciasScreen} />
            <Stack.Screen name="VisitasScreen" component={VisitasScreen} />
            <Stack.Screen name="BuscarColoniaScreen" component={BuscarColoniaScreen}/>
            <Stack.Screen name="CrearColoniaScreen" component={CrearColoniaScreen}/>
            <Stack.Screen name="CrearResidenciasScreen" component={CrearResidenciasScreen}/>
            <Stack.Screen name="ReclamarResidencia" component={ReclamarResidencia}/>
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// (Keep the rest of the App component the same as in the previous file)
export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Navigation />
          </View>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});