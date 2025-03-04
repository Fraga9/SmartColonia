import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Title, Divider } from 'react-native-paper';

const RequestForm = ({ formFields, onSubmit, title, buttonText, initialValues = {} }) => {
  // Initialize form data with fields from formFields and their initial values
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    formFields.forEach(field => {
      initialData[field.name] = initialValues[field.name] || '';
    });
    return initialData;
  });

  // Update form data when a field changes
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Process form data before submitting
    const processedData = {};
    
    formFields.forEach(field => {
      let value = formData[field.name];
      
      // Skip empty optional fields
      if ((value === '' || value === null || value === undefined) && field.optional) {
        return;
      }
      
      // Process value based on type
      if (field.type === 'number') {
        value = value === '' ? null : Number(value);
      } else if (field.type === 'boolean') {
        value = value === 'true' || value === true;
      } else if (field.type === 'json') {
        try {
          value = value === '' ? null : JSON.parse(value);
        } catch (error) {
          console.error(`Error parsing JSON for field ${field.name}:`, error);
          // Keep as string if parsing fails
        }
      }
      
      processedData[field.name] = value;
    });
    
    onSubmit(processedData);
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{title || 'Request Form'}</Title>
        <Divider style={styles.divider} />
        
        <ScrollView style={styles.scrollView}>
          {formFields.map((field) => (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {field.label} {field.optional ? '(opcional)' : ''}:
              </Text>
              <TextInput
                mode="outlined"
                placeholder={field.placeholder}
                value={formData[field.name]?.toString() || ''}
                onChangeText={(text) => handleChange(field.name, text)}
                style={styles.input}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 4 : 1}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              />
              {field.helperText && (
                <Text style={styles.helperText}>{field.helperText}</Text>
              )}
            </View>
          ))}
        </ScrollView>
        
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          style={styles.button}
        >
          {buttonText || 'Enviar'}
        </Button>
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
  scrollView: {
    maxHeight: 400,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
  },
  helperText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  button: {
    marginTop: 15,
  }
});

export default RequestForm;