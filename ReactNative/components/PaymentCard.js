import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Card, Text as PaperText, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PaymentCard = ({ payments, formatDate, navigation }) => {
  const theme = useTheme();

  return (
    <Surface style={styles.paymentsCard} elevation={1}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="credit-card" size={24} color={theme.colors.primary} />
        <PaperText style={[styles.sectionTitle, { fontFamily: theme.fonts.bold.fontFamily, color: theme.colors.primary }]}>
          Pagos
        </PaperText>
      </View>
      
      {payments.map((payment, index) => (
        <Card style={styles.paymentItem} key={index}>
          <Card.Content>
            <PaperText style={[styles.paymentTitle, { fontFamily: theme.fonts.bold.fontFamily }]}>
              {payment.concepto}
            </PaperText>
            <PaperText style={[styles.paymentAmount, { fontFamily: theme.fonts.medium.fontFamily }]}>
              ${payment.monto}
            </PaperText>
            <PaperText style={[styles.paymentDate, { fontFamily: theme.fonts.regular.fontFamily }]}>
              Vence: {formatDate(payment.fecha_vencimiento)}
            </PaperText>
          </Card.Content>
        </Card>
      ))}
    </Surface>
  );
};

const styles = StyleSheet.create({
  paymentsCard: {
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
  paymentItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
  },
  paymentTitle: {
    fontSize: 16,
  },
  paymentAmount: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

export default PaymentCard;