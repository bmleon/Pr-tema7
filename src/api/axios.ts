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

// API Actividad 3: Hugging Face (Sprites) 
// Usamos URL directa y configuración mínima para evitar bloqueos de CORS en producción
export const hfApi = axios.create({
  baseURL: 'https://api-inference.huggingface.co/models/', 
  timeout: 60000, 
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`
  },
  responseType: 'arraybuffer' // Crucial para procesar la imagen correctamente
});

// -----------------------------------------------------------
// 2. INTERCEPTORES (REQUISITO ACTIVIDAD 4)
// -----------------------------------------------------------

const apiInstances = [jobApi, iaApi, hfApi];

apiInstances.forEach(instance => {
  
  // INTERCEPTOR DE PETICIÓN (Request): Inyectar Token de GitHub
  instance.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    
    // Si el usuario está autenticado en Pinia, enviamos su token
    if (authStore.token) {
      // Usamos la cabecera estándar de Authorization
      config.headers.Authorization = `Bearer ${authStore.token}`;
      console.log(`[Auth] Seguridad aplicada a: ${config.baseURL}`);
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

      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("⚠️ Tu sesión ha expirado o no tienes permisos. Por seguridad, debes iniciar sesión de nuevo.");
        authStore.logout();
      }
      
      return Promise.reject(error);
    }
  );
});