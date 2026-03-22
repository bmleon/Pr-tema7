import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

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
  baseURL: '/hf-api/', 
  timeout: 60000, 
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const apiInstances = [jobApi, iaApi, hfApi];
apiInstances.forEach(instance => {
  instance.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    
    if (config.baseURL?.includes('hf-api') || config.baseURL?.includes('groq')) {
      return config;
    }
    
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  });
});