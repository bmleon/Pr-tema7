import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// -----------------------------------------------------------
// 1. CONFIGURACIÓN DE INSTANCIAS (axios.create)
// -----------------------------------------------------------

// API Actividad 1: Beeceptor (Jobs)
export const jobApi = axios.create({
  baseURL: 'https://belen-jobs-api.free.beeceptor.com', 
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// API Actividad 2: Groq (IA UML)
export const iaApi = axios.create({
  baseURL: 'https://api.groq.com/openai/v1', 
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_IA_API_KEY}`
  }
});

// API Actividad 3: Hugging Face (Sprites) - USANDO PROXY VITE
export const hfApi = axios.create({
  baseURL: '/hf-api/models/', 
  timeout: 60000, 
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'image/jpeg' 
  }
});

// -----------------------------------------------------------
// 2. INTERCEPTORES (REQUISITO ACTIVIDAD 4)
// -----------------------------------------------------------

// Arreglo de todas nuestras instancias para aplicarles la seguridad de golpe
const apiInstances = [jobApi, iaApi, hfApi];

apiInstances.forEach(instance => {
  
  // INTERCEPTOR DE PETICIÓN (Request): Inyectar Token de GitHub
  instance.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    
    // Si el usuario está autenticado en Pinia, enviamos su token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
      console.log(`[Auth] Token inyectado en la petición a: ${config.baseURL}`);
    }
    
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // INTERCEPTOR DE RESPUESTA (Response): Manejo global de errores 401/403
  instance.interceptors.response.use(
    (response) => response, 
    (error) => {
      const authStore = useAuthStore();

      // Si la API responde que el token no es válido o ha expirado
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        
        // REQUISITO: Mostrar notificación (Toast/Alert)
        alert("⚠️ Tu sesión ha expirado o no tienes permisos. Por seguridad, debes iniciar sesión de nuevo.");
        
        // REQUISITO: Borrar token de Pinia
        authStore.logout();
        
        // Opcional: Redirigir a la página de inicio/login
        // window.location.href = '/';
      }
      
      return Promise.reject(error);
    }
  );
});