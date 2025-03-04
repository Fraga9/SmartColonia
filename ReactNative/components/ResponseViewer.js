import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Title, Subheading, Divider } from 'react-native-paper';

const ResponseViewer = ({ response, requestData, endpoint, method }) => {
  // Format the response object for display
  const formatResponse = (obj) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return `Error formatting response: ${error.message}`;
    }
  };

  // Determine text color based on success status
  const getStatusColor = () => {
    if (!response) return 'gray';
    return response.success ? 'green' : 'red';
  };

  if (!response) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>API Response</Title>
        <Divider style={styles.divider} />
        
        <View style={styles.requestInfo}>
          <Subheading>Request Details:</Subheading>
          <Text>Endpoint: {endpoint}</Text>
          <Text>Method: {method}</Text>
          {requestData && (
            <View style={styles.requestDataContainer}>
              <Text>Request Data:</Text>
              <ScrollView style={styles.codeScroll}>
                <Text style={styles.code}>{formatResponse(requestData)}</Text>
              </ScrollView>
            </View>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.responseInfo}>
          <Subheading>Response:</Subheading>
          <Text style={{ color: getStatusColor() }}>
            Status: {response.success ? 'Success' : `Error (${response.status || 'unknown'})`}
          </Text>
          
          {response.error && (
            <Text style={styles.errorText}>Error: {response.error}</Text>
          )}
          
          <ScrollView style={styles.codeScroll}>
            <Text style={styles.code}>
              {formatResponse(response.data || response.error || response)}
            </Text>
          </ScrollView>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 10,
    elevation: 4,
  },
  divider: {
    marginVertical: 10,
  },
  requestInfo: {
    marginBottom: 10,
  },
  responseInfo: {
    marginTop: 5,
  },
  codeScroll: {
    maxHeight: 300,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  requestDataContainer: {
    marginTop: 10,
  }
});

export default ResponseViewer;