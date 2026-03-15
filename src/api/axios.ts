import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// API Actividad 1: Beeceptor
export const jobApi = axios.create({
  baseURL: 'https://belen-jobs-api.free.beeceptor.com', 
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// API Actividad 2: Groq
export const iaApi = axios.create({
  baseURL: 'https://api.groq.com/openai/v1', 
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_IA_API_KEY}`
  }
});

// API Actividad 3: Hugging Face (URL DIRECTA, SIN PROXY)
export const hfApi = axios.create({
  baseURL: 'https://api-inference.huggingface.co/models/', 
  timeout: 60000, 
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
    'Content-Type': 'application/json'
  },
  responseType: 'arraybuffer'
});

// INTERCEPTORES
const apiInstances = [jobApi, iaApi, hfApi];
apiInstances.forEach(instance => {
  instance.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    
    // ESCUDO: Si la petición va a Hugging Face o Groq, NO inyectamos el token de GitHub
    if (config.baseURL?.includes('huggingface') || config.baseURL?.includes('groq')) {
      return config;
    }
    
    // Si es para nuestra propia API o Beeceptor, sí lo enviamos
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  });
});