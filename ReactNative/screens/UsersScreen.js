import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Title, Divider, Button, Text, Card } from 'react-native-paper';
import RequestForm from '../components/RequestForm';
import ResponseViewer from '../components/ResponseViewer';
import UsersAPI from '../api/users';

const UsersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [response, setResponse] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [userId, setUserId] = useState('');

  // Form fields for creating a user
  const createUserFields = [
    { name: 'email', label: 'Email', placeholder: 'ejemplo@correo.com', type: 'string' },
    { name: 'password', label: 'Contraseña', placeholder: 'Contraseña', type: 'string' },
    { name: 'nombre', label: 'Nombre', placeholder: 'Nombre', type: 'string' },
    { name: 'apellido', label: 'Apellido', placeholder: 'Apellido', type: 'string' },
    { name: 'telefono', label: 'Teléfono', placeholder: '1234567890', type: 'string' },
    { name: 'tipo_usuario_id', label: 'Tipo de Usuario ID', placeholder: '1', type: 'number' },
    { name: 'colonia_id', label: 'Colonia ID', placeholder: 'UUID o null', type: 'string', optional: true },
    { name: 'activo', label: 'Activo', placeholder: 'true o false', type: 'boolean' }
  ];

  // Handle creating a user
  const handleCreateUser = async (data) => {
    setRequestData(data);
    setResponse(null);
    
    try {
      const result = await UsersAPI.createUser(data);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  // Handle getting all users
  const handleGetUsers = async () => {
    setRequestData(null);
    setResponse(null);
    
    try {
      const result = await UsersAPI.getUsers();
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        error: error.message,
        data: null
      });
    }
  };

  // Handle getting a user by ID
  const handleGetUserById = async () => {
    if (!userId) {
      setResponse({
        success: false,
        error: 'Se requiere ID de usuario',
        data: null
      });
      return;
    }
    
    setRequestData({ userId });
    setResponse(null);
    
    try {
      const result = await UsersAPI.getUserById(userId);
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
        <Appbar.Content title="Usuarios API" subtitle="Prueba de endpoints de usuarios" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.tabCard}>
          <Card.Content style={styles.tabContainer}>
            <Button 
              mode={activeTab === 'create' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('create')}
              style={styles.tabButton}
            >
              Crear Usuario
            </Button>
            <Button 
              mode={activeTab === 'getAll' ? 'contained' : 'outlined'} 
              onPress={() => setActiveTab('getAll')}
              style={styles.tabButton}
            >
              Ver Todos
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
            formFields={createUserFields}
            onSubmit={handleCreateUser}
            title="Crear Usuario"
            buttonText="Crear Usuario"
          />
        )}
        
        {activeTab === 'getAll' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Obtener Todos los Usuarios</Title>
              <Text style={styles.description}>
                Este endpoint devuelve la lista de todos los usuarios registrados.
              </Text>
              <Button 
                mode="contained" 
                onPress={handleGetUsers}
                style={styles.button}
              >
                Obtener Usuarios
              </Button>
            </Card.Content>
          </Card>
        )}
        
        {activeTab === 'getById' && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Buscar Usuario por ID</Title>
              <Text style={styles.description}>
                Este endpoint devuelve un usuario específico según su ID.
              </Text>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>ID del Usuario:</Text>
                <RequestForm 
                  formFields={[
                    { name: 'userId', label: 'ID del Usuario', placeholder: 'UUID del usuario' }
                  ]}
                  onSubmit={(data) => {
                    setUserId(data.userId);
                    handleGetUserById();
                  }}
                  buttonText="Buscar Usuario"
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
              activeTab === 'create' ? '/usuarios/' : 
              activeTab === 'getAll' ? '/usuarios/' : 
              `/usuarios/${userId}`
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

export default UsersScreen;