import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Title, Divider, Button, Text, Card } from 'react-native-paper';
import RequestForm from '../components/RequestForm';
import ResponseViewer from '../components/ResponseViewer';
import VisitasAPI from '../api/visitas';

const VisitasScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [response, setResponse] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [visitaId, setVisitaId] = useState('');

  // Form fields for creating a visita
  const createVisitaFields = [
    { 
      name: 'nombre_visitante', 
      label: 'Nombre del Visitante', 
      placeholder: 'Nombre del visitante', 
      type: 'string',
      required: true
    },
    { 
      name: 'apellido_visitante', 
      label: 'Apellido del Visitante', 
      placeholder: 'Apellido del visitante', 
      type: 'string',
      required: true
    },
    { 
      name: 'tipo', 
      label: 'Tipo de Visita', 
      placeholder: 'Visita/Servicio/Recurrente', 
      type: 'select',
      options: ['Visita', 'Servicio', 'Recurrente'],
      required: true
    },
    { 
      name: 'fecha_programada', 
      label: 'Fecha Programada', 
      placeholder: '2024-03-02T14:30:00', 
      type: 'datetime',
      required: true
    },
    { 
      name: 'residencia_id', 
      label: 'ID Residencia', 
      placeholder: 'UUID de la residencia', 
      type: 'string',
      required: true
    },
    { 
      name: 'usuario_id', 
      label: 'ID Usuario', 
      placeholder: 'UUID del usuario', 
      type: 'string',
      required: true
    }
  ];

  // Handle creating a visita
  const handleCreateVisita = async (data) => {
    setRequestData(data);
    setResponse(null);
    
    try {
      // Format the datetime field
      const formattedData = {
        ...data,
        fecha_programada: new Date(data.fecha_programada).toISOString()
      };

      const result = await VisitasAPI.createVisita(formattedData);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  // Handle getting all visitas
  const handleGetVisitas = async () => {
    setRequestData(null);
    setResponse(null);
    
    try {
      const result = await VisitasAPI.getVisitas();
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  // Handle getting a visita by ID
  const handleGetVisitaById = async () => {
    if (!visitaId) {
      setResponse({
        success: false,
        error: 'Se requiere ID de la visita',
        data: null
      });
      return;
    }
    
    setRequestData({ visitaId });
    setResponse(null);
    
    try {
      const result = await VisitasAPI.getVisitaById(visitaId);
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
        <Appbar.Content title="Visitas API" subtitle="Prueba de endpoints de visitas" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.tabCard}>
          <Card.Content style={styles.tabContainer}>
            <Button 
              mode={activeTab === 'create' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('create')}
              style={styles.tabButton}
            >
              Crear Visita
            </Button>
            <Button 
              mode={activeTab === 'getAll' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('getAll')}
              style={styles.tabButton}
            >
              Ver Todas
            </Button>
            <Button 
              mode={activeTab === 'getById' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('getById')}
              style={styles.tabButton}
            >
              Buscar por ID
            </Button>
          </Card.Content>
        </Card>
        
        <Divider style={styles.divider} />
        
        {activeTab === 'create' && (
          <RequestForm 
            formFields={createVisitaFields}
            onSubmit={handleCreateVisita}
            title="Crear Visita"
            buttonText="Registrar Visita"
          />
        )}
        
        {activeTab === 'getAll' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Obtener Todas las Visitas</Title>
              <Text style={styles.description}>
                Este endpoint devuelve la lista de todas las visitas registradas.
              </Text>
              <Button 
                mode="contained" 
                onPress={handleGetVisitas}
                style={styles.button}
              >
                Obtener Visitas
              </Button>
            </Card.Content>
          </Card>
        )}
        
        {activeTab === 'getById' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Buscar Visita por ID</Title>
              <Text style={styles.description}>
                Este endpoint devuelve una visita específica según su ID.
              </Text>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>ID de la Visita:</Text>
                <RequestForm 
                  formFields={[
                    { name: 'visitaId', label: 'ID de la Visita', placeholder: 'UUID de la visita' }
                  ]}
                  onSubmit={(data) => {
                    setVisitaId(data.visitaId);
                    handleGetVisitaById();
                  }}
                  buttonText="Buscar Visita"
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
              activeTab === 'create' ? '/visitas/' : 
              activeTab === 'getAll' ? '/visitas/' : 
              `/visitas/${visitaId}`
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

export default VisitasScreen;