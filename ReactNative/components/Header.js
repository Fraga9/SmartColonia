import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Surface, Avatar, IconButton, Badge, useTheme, Text as PaperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const Header = ({ userName, userRole, newNotifications, navigation }) => {
  const theme = useTheme();

  return (
    <Surface style={styles.headerContainer} elevation={0}>
      <LinearGradient
        colors={['#2196F3', '#03A9F4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.welcomeSection}>
          <View>
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
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationContainer}
              onPress={() => navigation.navigate('NotificationsScreen')}
            >
              <View style={styles.iconBackground}>
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
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ProfileScreen')}
              style={styles.avatarContainer}
            >
              <Avatar.Image 
                size={40} 
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                style={styles.userAvatar}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 5,
    borderRadius: 0,
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: StatusBar.currentHeight + 15,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 22,
    letterSpacing: 0.3,
  },
  roleContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 5,
  },
  notificationContainer: {
    position: 'relative',
    marginRight: 10,
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
    padding: 2,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default Header;