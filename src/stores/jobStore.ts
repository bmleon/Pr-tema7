import { defineStore } from 'pinia';
import { jobApi } from '../api/axios';

export interface Job {
  id?: number;
  empresa: string;
  puesto: string;
  estado: 'CV Enviado' | 'Entrevista Técnica' | 'Entrevista RRHH' | 'Rechazado' | 'Oferta Recibida';
}

export const useJobStore = defineStore('jobStore', {
  state: () => ({
    jobs: [] as Job[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    // GET: Obtener todas las candidaturas
    async fetchJobs() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await jobApi.get('/jobs');
        
        // ESCUDO PROTECTOR: Aseguramos que siempre sea una lista
        if (Array.isArray(data)) {
          this.jobs = data;
        } else if (data && typeof data === 'object') {
          this.jobs = [data as unknown as Job];
        } else {
          this.jobs = [];
        }
      } catch (err) {
        console.error("Error en fetchJobs:", err);
      } finally {
        this.loading = false;
      }
    },

    // POST: Crear una nueva candidatura
    async addJob(job: Job) {
      try {
        // 1. Lo enviamos a Beeceptor
        await jobApi.post('/jobs', job);
        
        // 2. TRUCO: Lo añadimos directamente a nuestra lista local 
        // inventándonos un ID (Date.now()) para que Vue lo pinte al instante y no salga vacío.
        this.jobs.push({
          ...job,
          id: Date.now() 
        });
      } catch (err) {
        console.error("Error en addJob:", err);
      }
    },

    // PUT: Actualizar estado
    async updateJob(id: number, updatedJob: Job) {
      try {
        await jobApi.put(`/jobs/${id}`, updatedJob);
        const index = this.jobs.findIndex(j => j.id === id);
        if (index !== -1) {
          this.jobs[index] = { ...updatedJob };
        }
      } catch (err) {
        console.error("Error en updateJob:", err);
      }
    },

    // DELETE: Eliminar candidatura
    async deleteJob(id: number) {
      try {
        await jobApi.delete(`/jobs/${id}`);
        this.jobs = this.jobs.filter(j => j.id !== id);
      } catch (err) {
        console.error("Error en deleteJob:", err);
      }
    }
  }
});