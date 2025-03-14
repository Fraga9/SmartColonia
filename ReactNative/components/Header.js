import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Animated } from 'react-native';
import { Surface, Avatar, IconButton, Badge, useTheme, Text as PaperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

const Header = ({ userName, userRole, newNotifications, navigation }) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');

  return (
    <View style={styles.headerContainer}>
      {/* Gradient background with modern colors */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated decorative elements */}
        <MotiView 
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ type: 'timing', duration: 1000 }}
          style={[styles.circleDecoration, { left: width * 0.1 }]} 
        />
        <MotiView 
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ type: 'timing', duration: 1000, delay: 200 }}
          style={[styles.circleDecoration, { right: width * 0.15, top: 30 }]} 
        />
        
        <View style={styles.welcomeSection}>
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 700 }}
          >
            <PaperText style={[styles.welcomeText, { fontFamily: theme.fonts.medium.fontFamily, color: '#fff' }]}>
              Bienvenido,
            </PaperText>
            <PaperText style={[styles.userName, { fontFamily: theme.fonts.bold.fontFamily, color: '#fff' }]}>
              {userName}
            </PaperText>
            {userRole && (
              <View style={styles.roleContainer}>
                <PaperText style={[styles.userRole, { fontFamily: theme.fonts.regular.fontFamily }]}>
                  {userRole}
                </PaperText>
              </View>
            )}
          </MotiView>
          <View style={styles.headerActions}>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 300 }}
            >
              <TouchableOpacity 
                style={styles.notificationContainer}
                onPress={() => navigation.navigate('NotificationsScreen')}
                accessibilityLabel="Notificaciones"
                accessibilityHint="Pulsa para ver tus notificaciones"
              >
                <BlurView intensity={30} tint="light" style={styles.iconBackground}>
                  <IconButton 
                    icon="bell-outline" 
                    size={22} 
                    color="#fff"
                    style={styles.notificationIcon}
                  />
                  {newNotifications > 0 && (
                    <Badge 
                      style={styles.notificationBadge}
                      size={18}
                    >
                      {newNotifications}
                    </Badge>
                  )}
                </BlurView>
              </TouchableOpacity>
            </MotiView>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 400 }}
            >
              <TouchableOpacity 
                onPress={() => navigation.navigate('ProfileScreen')}
                style={styles.avatarContainer}
                accessibilityLabel="Perfil de usuario"
                accessibilityHint="Pulsa para ver tu perfil"
              >
                <BlurView intensity={20} tint="light" style={styles.avatarBlur}>
                  <Avatar.Image 
                    size={42} 
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                    style={styles.userAvatar}
                  />
                </BlurView>
              </TouchableOpacity>
            </MotiView>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: StatusBar.currentHeight + 15,
    paddingHorizontal: 20,
    paddingBottom: 60, // Extended to allow content card to overlap
  },
  circleDecoration: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: 10,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 24,
    letterSpacing: 0.3,
    marginTop: 4,
  },
  roleContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
    backdropFilter: 'blur(8px)',
  },
  userRole: {
    fontSize: 12,
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    borderRadius: 50,
    padding: 5,
    overflow: 'hidden',
  },
  notificationContainer: {
    position: 'relative',
    marginRight: 12,
    // Make tap target larger for better accessibility (Fitts's Law)
    padding: 4, 
  },
  notificationIcon: {
    margin: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    // Make tap target larger for better accessibility (Fitts's Law)
    padding: 4,
  },
  avatarBlur: {
    padding: 3,
    borderRadius: 50,
    overflow: 'hidden',
  },
  userAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default Header;