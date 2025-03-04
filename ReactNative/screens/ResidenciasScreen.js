import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Title, Divider, Button, Text, Card } from 'react-native-paper';
import RequestForm from '../components/RequestForm';
import ResponseViewer from '../components/ResponseViewer';
import ResidenciasAPI from '../api/residencias';

const ResidenciasScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [response, setResponse] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [residenciaId, setResidenciaId] = useState('');

  // Form fields for creating a residencia
  const createResidenciaFields = [
    { 
      name: 'numero', 
      label: 'Número', 
      placeholder: 'Número de la residencia', 
      type: 'string',
      required: true
    },
    { 
      name: 'calle', 
      label: 'Calle', 
      placeholder: 'Nombre de la calle', 
      type: 'string',
      required: true
    },
    { 
      name: 'referencia', 
      label: 'Referencia', 
      placeholder: 'Referencia adicional', 
      type: 'string',
      required: false
    },
    { 
      name: 'colonia_id', 
      label: 'ID Colonia', 
      placeholder: 'UUID de la colonia', 
      type: 'string',
      required: true
    }
  ];

  // Handle creating a residencia
  const handleCreateResidencia = async (data) => {
    setRequestData(data);
    setResponse(null);
    
    try {
      const result = await ResidenciasAPI.createResidencia(data);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  // Handle getting all residencias
  const handleGetResidencias = async () => {
    setRequestData(null);
    setResponse(null);
    
    try {
      const result = await ResidenciasAPI.getResidencias();
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  // Handle getting a residencia by ID
  const handleGetResidenciaById = async () => {
    if (!residenciaId) {
      setResponse({
        success: false,
        error: 'Se requiere ID de la residencia',
        data: null
      });
      return;
    }
    
    setRequestData({ residenciaId });
    setResponse(null);
    
    try {
      const result = await ResidenciasAPI.getResidenciaById(residenciaId);
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
        <Appbar.Content title="Residencias API" subtitle="Gestión de Residencias" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.tabCard}>
          <Card.Content style={styles.tabContainer}>
            <Button 
              mode={activeTab === 'create' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('create')}
              style={styles.tabButton}
            >
              Registrar Residencia
            </Button>
            <Button 
              mode={activeTab === 'getAll' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('getAll')}
              style={styles.tabButton}
            >
              Listar Residencias
            </Button>
            <Button 
              mode={activeTab === 'getById' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('getById')}
              style={styles.tabButton}
            >
              Buscar Residencia
            </Button>
          </Card.Content>
        </Card>
        
        <Divider style={styles.divider} />
        
        {activeTab === 'create' && (
          <RequestForm 
            formFields={createResidenciaFields}
            onSubmit={handleCreateResidencia}
            title="Registrar Nueva Residencia"
            buttonText="Registrar"
          />
        )}
        
        {activeTab === 'getAll' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Listar Residencias</Title>
              <Text style={styles.description}>
                Este endpoint devuelve la lista de todas las residencias registradas.
              </Text>
              <Button 
                mode="contained" 
                onPress={handleGetResidencias}
                style={styles.button}
              >
                Obtener Residencias
              </Button>
            </Card.Content>
          </Card>
        )}
        
        {activeTab === 'getById' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Buscar Residencia por ID</Title>
              <Text style={styles.description}>
                Este endpoint devuelve una residencia específica según su ID.
              </Text>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>ID de la Residencia:</Text>
                <RequestForm 
                  formFields={[
                    { name: 'residenciaId', label: 'ID de la Residencia', placeholder: 'UUID de la residencia' }
                  ]}
                  onSubmit={(data) => {
                    setResidenciaId(data.residenciaId);
                    handleGetResidenciaById();
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
              activeTab === 'create' ? '/residencias/' : 
              activeTab === 'getAll' ? '/residencias/' : 
              `/residencias/${residenciaId}`
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
});

export default ResidenciasScreen;