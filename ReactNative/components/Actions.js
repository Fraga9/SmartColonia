import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Text, Surface, Badge, IconButton } from 'react-native-paper';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;
const SPACING = 12;

const Actions = ({ navigation, pendingVisits = 2, user, residencias = [] }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState('frequent');
  
  // Define a common set of primary and secondary actions
  const primaryActions = [
    {
      id: 'register-visit',
      icon: 'account-plus',
      text: 'Registrar visita',
      color: '#2196F3',         // Azul primario del tema
      secondaryColor: '#90CAF9', // Versión más clara
      screen: 'RegisterVisitScreen',
      badge: null,
      description: 'Registra una nueva visita'
    },
    {
      id: 'my-visits',
      icon: 'account-group',
      text: 'Mis visitas',
      color: '#1976D2',         // Azul un poco más oscuro
      secondaryColor: '#64B5F6', // Su versión más clara
      screen: 'MisVisitasScreen',
      badge: pendingVisits > 0 ? pendingVisits : null,
      description: 'Administra tus visitas activas'
    },
    {
      id: 'qr-code',
      icon: 'qrcode-scan',
      text: 'QR de acceso',
      color: '#0D47A1',         // Azul aún más oscuro
      secondaryColor: '#42A5F5', // Su versión más clara
      screen: 'QRGeneratorScreen',
      badge: null,
      description: 'Genera códigos QR para invitados'
    },
    {
      id: 'services',
      icon: 'toolbox',
      text: 'Servicios',
      color: '#03A9F4',         // Color de acento del tema
      secondaryColor: '#81D4FA', // Su versión más clara
      screen: 'ServiciosScreen',
      badge: null,
      description: 'Solicita servicios para tu hogar'
    }
  ];

  const secondaryActions = [
    {
      id: 'payments',
      icon: 'credit-card-outline',
      text: 'Pagos',
      color: '#00BCD4',         // Cian, complementario al azul
      secondaryColor: '#80DEEA', // Su versión más clara
      screen: 'PagosScreen',
      description: 'Administra tus pagos'
    },
    {
      id: 'reports',
      icon: 'alert-outline',
      text: 'Reportes',
      color: '#FF5722',         // Naranja rojizo para alertas
      secondaryColor: '#FFAB91', // Su versión más clara
      screen: 'ReportesScreen',
      description: 'Reporta incidentes'
    },
    {
      id: 'announcement',
      icon: 'bullhorn-outline',
      text: 'Anuncios',
      color: '#009688',         // Verde azulado
      secondaryColor: '#80CBC4', // Su versión más clara
      screen: 'AnunciosScreen',
      description: 'Mira los anuncio de tu colonia'
    },
    {
      id: 'directory',
      icon: 'book-outline',
      text: 'Directorio',
      color: '#673AB7',         // Púrpura, complementario
      secondaryColor: '#B39DDB', // Su versión más clara
      screen: 'DirectorioScreen',
      description: 'Contactos importantes'
    }
  ];

  // Function to render primary action cards
  const renderPrimaryCard = (item, index) => {
    return (
      <MotiView
        key={item.id}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300 + index * 100, type: 'timing', duration: 500 }}
        style={styles.cardContainer}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            // Para RegisterVisitScreen, pasamos los datos necesarios
            if (item.screen === 'RegisterVisitScreen') {
              navigation.navigate(item.screen, {
                userId: user.id,           // Agrega user como prop al componente Actions
                residencias: residencias   // Agrega residencias como prop al componente Actions
              });
            } else {
              navigation.navigate(item.screen);
            }
          }}
          style={[styles.touchable, { width: CARD_WIDTH }]}
          accessibilityLabel={item.text}
          accessibilityHint={item.description}
        >
          <LinearGradient
            colors={[item.color, item.secondaryColor]}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            style={styles.cardGradient}
          >
            {/* Decorative elements */}
            <View style={[styles.cardDecoration, styles.cardDecorationTop]} />
            <View style={[styles.cardDecoration, styles.cardDecorationBottom]} />
            
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={item.icon} size={32} color="#FFF" />
                {item.badge && (
                  <Badge
                    size={20}
                    style={styles.badge}
                  >
                    {item.badge}
                  </Badge>
                )}
              </View>
              <View style={styles.textContainer}>
                  <Text style={[styles.cardTitle, { fontFamily: theme.fonts.bold.fontFamily }]}>{item.text}</Text>
                  <Text style={[styles.cardDescription, { fontFamily: theme.fonts.regular.fontFamily }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    );
  };

  // Function to render secondary action cards - New horizontal scrollable design
  const renderSecondaryAction = (item, index) => {
    return (
      <MotiView
        key={item.id}
        from={{ opacity: 0, translateX: 30 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ delay: 500 + index * 100, type: 'spring', damping: 15 }}
        style={styles.secondaryCardContainer}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate(item.screen)}
          style={styles.secondaryTouchable}
        >
          <Surface style={styles.secondaryCard}>
            <LinearGradient
              colors={[`${item.color}15`, `${item.color}30`]}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 1.0, y: 1.0 }}
              style={styles.secondaryCardGradient}
            >
              <View style={styles.secondaryCardContent}>
                <View style={[styles.secondaryIconContainer, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color="#FFF" />
                </View>
                <View style={styles.secondaryTextContainer}>
                  <Text style={[styles.secondaryCardTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.secondaryCardDescription, { fontFamily: theme.fonts.regular.fontFamily }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={item.color} style={styles.arrowIcon} />
              </View>
            </LinearGradient>
          </Surface>
        </TouchableOpacity>
      </MotiView>
    );
  };

  // Tab selector for frequent/all actions
  const renderTabSelector = () => {
    return (
      <View style={styles.tabSelector}>
        <TouchableOpacity
          onPress={() => setActiveSection('frequent')}
          style={[
            styles.tab,
            activeSection === 'frequent' && styles.activeTab
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { fontFamily: theme.fonts.medium.fontFamily },
              activeSection === 'frequent' && { color: theme.colors.primary, fontFamily: theme.fonts.bold.fontFamily }
            ]}
          >
            Acciones frecuentes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSection('all')}
          style={[
            styles.tab,
            activeSection === 'all' && styles.activeTab
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { fontFamily: theme.fonts.medium.fontFamily },
              activeSection === 'all' && { color: theme.colors.primary, fontFamily: theme.fonts.bold.fontFamily }
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
        <Text style={[styles.title, { color: theme.colors.primary, fontFamily: theme.fonts.bold.fontFamily }]}>
          Acciones rápidas
        </Text>
        </MotiView>
        {renderTabSelector()}
      </View>

      {/* Primary Actions - Scrollable cards with large touch targets */}
      <View style={styles.primaryActionsContainer}>
        {primaryActions.map((item, index) => renderPrimaryCard(item, index))}
      </View>

      {/* Secondary actions - New horizontal scrollable design */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 400, type: 'timing', duration: 500 }}
        style={styles.sectionTitleContainer}
      >
        <Text style={[styles.sectionTitle, { fontFamily: theme.fonts.medium.fontFamily }]}>Acciones adicionales</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { fontFamily: theme.fonts.medium.fontFamily }]}>Ver todas</Text>
        </TouchableOpacity>
      </MotiView>
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.secondaryActionsScrollContainer}
      >
        {secondaryActions.map((item, index) => renderSecondaryAction(item, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  headerContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
  },
  primaryActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 130,
    position: 'relative',
  },
  cardDecoration: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  cardDecorationTop: {
    width: 80,
    height: 80,
    top: -30,
    right: -20,
  },
  cardDecorationBottom: {
    width: 60,
    height: 60,
    bottom: -20,
    left: -20,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5252',
  },
  textContainer: {
    alignSelf: 'stretch',
  },
  cardTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  // New styles for section title with "Ver todas" option
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  viewAllText: {
    fontSize: 12,
    color: theme => theme.colors.primary,
  },
  // New styles for horizontal scrollable secondary actions
  secondaryActionsScrollContainer: {
    paddingLeft: 0,
    paddingRight: 16,
  },
  secondaryCardContainer: {
    marginRight: 12,
    width: width * 0.75,
  },
  secondaryTouchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  secondaryCardGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  secondaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  secondaryTextContainer: {
    flex: 1,
  },
  secondaryCardTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  secondaryCardDescription: {
    fontSize: 12,
    color: '#666',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  tabSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
});

export default Actions;