import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// 1. CONFIGURACIÓN DE INSTANCIAS
// -----------------------------------------------------------

export const jobApi = axios.create({
  baseURL: 'https://belen-jobs-api.free.beeceptor.com', 
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

export const iaApi = axios.create({
  baseURL: 'https://api.groq.com/openai/v1', 
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_IA_API_KEY}`
  }
});

export const hfApi = axios.create({
  baseURL: 'https://api-inference.huggingface.co/models/', 
  timeout: 60000, 
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`
  },
  responseType: 'arraybuffer' 
});

// 2. INTERCEPTORES (CON FILTRO PARA EVITAR CORS)
// -----------------------------------------------------------

const apiInstances = [jobApi, iaApi, hfApi];

apiInstances.forEach(instance => {
  instance.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    
    // EXCEPCIÓN: Si la petición va a Hugging Face, NO inyectamos el token de GitHub
    // Esto es lo que soluciona el error de CORS en producción
    if (config.baseURL?.includes('huggingface.co')) {
      return config; 
    }

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
      console.log(`[Auth] Seguridad aplicada a: ${config.baseURL}`);
    }
    
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  instance.interceptors.response.use(
    (response) => response, 
    (error) => {
      const authStore = useAuthStore();
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Solo avisamos si NO es Hugging Face (para no confundir errores)
        if (!error.config.url?.includes('huggingface')) {
          alert("⚠️ Tu sesión ha expirado. Inicia sesión de nuevo.");
          authStore.logout();
        }
      }
      return Promise.reject(error);
    }
  );
});