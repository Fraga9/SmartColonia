import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, Text as PaperText } from 'react-native-paper';

const Actions = ({ navigation }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <PaperText style={[styles.title, { fontFamily: theme.fonts.bold.fontFamily, color: theme.colors.primary }]}>
        Acciones
      </PaperText>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('RegistrarVisitasScreen')}>
          <MaterialCommunityIcons name="account-plus" size={24} color={theme.colors.accent} />
          <PaperText style={[styles.actionText, { fontFamily: theme.fonts.medium.fontFamily }]}>
            Registrar visitas
          </PaperText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('MisVisitasScreen')}>
          <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.accent} />
          <PaperText style={[styles.actionText, { fontFamily: theme.fonts.medium.fontFamily }]}>
            Mis visitas
          </PaperText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('QRGeneratorScreen')}>
          <MaterialCommunityIcons name="qrcode" size={24} color={theme.colors.accent} />
          <PaperText style={[styles.actionText, { fontFamily: theme.fonts.medium.fontFamily }]}>
            QR de acceso
          </PaperText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate('ServiciosScreen')}>
          <MaterialCommunityIcons name="tools" size={24} color={theme.colors.accent} />
          <PaperText style={[styles.actionText, { fontFamily: theme.fonts.medium.fontFamily }]}>
            Servicios
          </PaperText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
});

export default Actions;