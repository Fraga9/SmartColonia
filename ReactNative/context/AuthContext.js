// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase client
// Note: In production, you should use environment variables
const supabase = createClient(
  "https://uammxewwluoirsfdvfmu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhbW14ZXd3bHVvaXJzZmR2Zm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4OTgxMzMsImV4cCI6MjA1NjQ3NDEzM30.SnxQvxrv0mAUze0cifJPCxDCHj4M_vvnrsM9DB967yI"
);

// Create the context
const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authSubscription, setAuthSubscription] = useState(null);

  // Check current session and set up listener on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Verificando sesión actual...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error al verificar sesión:", error.message);
        } else if (session) {
          console.log("Sesión activa encontrada:", session.user.email);
          setUser(session.user);
        } else {
          console.log("No hay sesión activa");
        }
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change subscriber
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Evento de autenticación:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("Usuario autenticado:", currentSession?.user?.email);
          setUser(currentSession?.user || null);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          console.log("Usuario desconectado");
          setUser(null);
        }
      }
    );

    setAuthSubscription(subscription);
    checkSession();

    // Clean up subscription on unmount
    return () => {
      console.log("Limpiando suscripción de autenticación");
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      console.log("Iniciando sesión:", email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Inicio de sesión exitoso:", data.user.email);
      return { user: data.user, error: null };
    } catch (error) {
      console.error("Error en inicio de sesión:", error.message);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log("Sesión cerrada con éxito");
      return { error: null };
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Registro exitoso, verificación requerida:", data);
      return { user: data.user, error: null, session: data.session };
    } catch (error) {
      console.error("Error en registro:", error.message);
      return { user: null, error: error.message, session: null };
    } finally {
      setLoading(false);
    }
  };

  // Create value object with auth state and methods
  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
  };

  // Provide auth context to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};