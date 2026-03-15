import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// API Actividad 1: Beeceptor (Cambia la URL aquí si creas uno nuevo)
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

// API Actividad 3: Hugging Face (VUELVE EL PROXY)
export const hfApi = axios.create({
  baseURL: '/hf-api/models/', 
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
    
    // ESCUDO CORS: No inyectamos token en HF ni Groq
    if (config.baseURL?.includes('hf-api') || config.baseURL?.includes('groq')) {
      return config;
    }
    
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  });
});