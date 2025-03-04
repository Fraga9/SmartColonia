import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Appbar, Title, Divider, Button, Card, Text } from 'react-native-paper';
import RequestForm from '../components/RequestForm';
import ResponseViewer from '../components/ResponseViewer';
import ColoniasAPI from '../api/colonias';

const ColoniasScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [response, setResponse] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [coloniaId, setColoniaId] = useState('');
  const [coloniaData, setColoniaData] = useState({
    nombre: '',
    codigo_postal: '',
    ciudad: '',
    estado: ''
  });

  const createColoniaFields = [
    { 
      name: 'nombre', 
      label: 'Nombre', 
      placeholder: 'Nombre de la colonia', 
      type: 'string',
      required: true
    },
    { 
      name: 'codigo_postal', 
      label: 'Código Postal', 
      placeholder: 'Código postal de la colonia', 
      type: 'string',
      required: true
    },
    { 
      name: 'ciudad', 
      label: 'Ciudad', 
      placeholder: 'Ciudad', 
      type: 'string',
      required: true
    },
    { 
      name: 'estado', 
      label: 'Estado', 
      placeholder: 'Estado', 
      type: 'string',
      required: true
    }
  ];

  const handleCreateColonia = async (data) => {
    setRequestData(data);
    setResponse(null);
    
    try {
      const result = await ColoniasAPI.createColonia(data);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  const handleGetColonias = async () => {
    setRequestData(null);
    setResponse(null);
    
    try {
      const result = await ColoniasAPI.getColonias();
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  const handleGetColoniaById = async () => {
    if (!coloniaId) {
      setResponse({
        success: false,
        error: 'Se requiere ID de la colonia',
        data: null
      });
      return;
    }
    
    setRequestData({ coloniaId });
    setResponse(null);
    
    try {
      const result = await ColoniasAPI.getColoniaById(coloniaId);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Colonias API" subtitle="Gestión de Colonias" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.tabCard}>
          <Card.Content style={styles.tabContainer}>
            <Button 
              mode={activeTab === 'create' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('create')}
              style={styles.tabButton}
              children="Crear Colonia"
            />
            <Button 
              mode={activeTab === 'getAll' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('getAll')}
              style={styles.tabButton}
              children="Ver Todas"
            />
            <Button 
              mode={activeTab === 'getById' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('getById')}
              style={styles.tabButton}
              children="Buscar por ID"
            />
          </Card.Content>
        </Card>
        
        <Divider style={styles.divider} />
        
        {activeTab === 'create' && (
          <RequestForm 
            formFields={createColoniaFields}
            onSubmit={handleCreateColonia}
            title="Crear Nueva Colonia"
            buttonText="Crear"
          />
        )}
        
        {activeTab === 'getAll' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Obtener Todas las Colonias</Title>
              <Text style={styles.description}>
                Este endpoint devuelve la lista de todas las colonias registradas.
              </Text>
              <Button 
                mode="contained" 
                onPress={handleGetColonias}
                style={styles.button}
                children="Obtener Colonias"
              />
            </Card.Content>
          </Card>
        )}
        
        {activeTab === 'getById' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Buscar Colonia por ID</Title>
              <Text style={styles.description}>
                Este endpoint devuelve una colonia específica según su ID.
              </Text>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>ID de la Colonia:</Text>
                <RequestForm 
                  formFields={[{ name: 'coloniaId', label: 'ID de la Colonia', placeholder: 'UUID de la colonia' }]}
                  onSubmit={(data) => {
                    setColoniaId(data.coloniaId);
                    handleGetColoniaById();
                  }}
                  buttonText="Buscar"
                />
              </View>
            </Card.Content>
          </Card>
        )}
        
        {response && (
          <ResponseViewer 
            response={response} 
            requestData={requestData}
            endpoint={
              activeTab === 'create' ? '/colonias/' : 
              activeTab === 'getAll' ? '/colonias/' : 
              `/colonias/${coloniaId}`
            }
            method={activeTab === 'create' ? 'POST' : 'GET'}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
  },
  tabCard: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  divider: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
  fieldContainer: {
    marginTop: 10,
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
  },
  closeButton: {
    margin: 16,
  }
});

export default ColoniasScreen;
