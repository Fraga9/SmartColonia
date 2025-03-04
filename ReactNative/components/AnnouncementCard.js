import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Card, Text as PaperText, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AnnouncementCard = ({ announcements, formatDate }) => {
  const theme = useTheme();

  return (
    <Surface style={styles.announcementsCard} elevation={1}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="bullhorn" size={24} color={theme.colors.primary} />
        <PaperText style={[styles.sectionTitle, { fontFamily: theme.fonts.bold.fontFamily, color: theme.colors.primary }]}>
          Anuncios
        </PaperText>
      </View>
      
      {announcements.map((announcement, index) => (
        <Card style={styles.announcementItem} key={index}>
          <Card.Content>
            <PaperText style={[styles.announcementTitle, { fontFamily: theme.fonts.bold.fontFamily }]}>
              {announcement.title}
            </PaperText>
            <PaperText style={[styles.announcementDescription, { fontFamily: theme.fonts.regular.fontFamily }]}>
              {announcement.description}
            </PaperText>
            <PaperText style={[styles.announcementDate, { fontFamily: theme.fonts.regular.fontFamily }]}>
              {formatDate(announcement.created_at)}
            </PaperText>
          </Card.Content>
        </Card>
      ))}
    </Surface>
  );
};

const styles = StyleSheet.create({
  announcementsCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
  },
  announcementItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
  },
  announcementTitle: {
    fontSize: 16,
  },
  announcementDescription: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  announcementDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

export default AnnouncementCard;