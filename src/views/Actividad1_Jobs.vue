<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useJobStore, type Job } from '../stores/jobStore';

const store = useJobStore();
const nuevaEmpresa = ref('');
const nuevoPuesto = ref('');

const estadosPosibles = ['CV Enviado', 'Entrevista Técnica', 'Entrevista RRHH', 'Rechazado', 'Oferta Recibida'];

onMounted(async () => {
  await store.fetchJobs();
});

const handleAddJob = async () => {
  if (!nuevaEmpresa.value || !nuevoPuesto.value) return;
  const nuevoJob: Job = {
    empresa: nuevaEmpresa.value,
    puesto: nuevoPuesto.value,
    estado: 'CV Enviado'
  };
  await store.addJob(nuevoJob);
  nuevaEmpresa.value = '';
  nuevoPuesto.value = '';
};

const handleUpdateStatus = async (job: Job, nuevoEstado: string) => {
  if (job.id) {
    const jobActualizado = { ...job, estado: nuevoEstado as Job['estado'] };
    await store.updateJob(job.id, jobActualizado);
  }
};

// Función de seguridad para las clases CSS
const formatClass = (estado: string | undefined) => {
  if (!estado) return 'default-status';
  return estado.replace(/\s+/g, '-').toLowerCase();
};
</script>

<template>
  <div class="job-container">
    <h1 class="title">🚀 Job Tracker - Gestor de Candidaturas</h1>

    <section class="form-card">
      <h3>Nueva Candidatura</h3>
      <div class="form-group">
        <input v-model="nuevaEmpresa" placeholder="Nombre de la empresa (ej: Google)" />
        <input v-model="nuevoPuesto" placeholder="Puesto (ej: Frontend Developer)" />
        <button @click="handleAddJob" :disabled="!nuevaEmpresa || !nuevoPuesto" class="btn-add">
          Añadir Candidatura
        </button>
      </div>
    </section>

    <section class="list-section">
      <h3>Mis Candidaturas</h3>
      <div v-if="store.loading" class="loader">Cargando datos de Beeceptor...</div>
      
      <table v-else class="job-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Puesto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in store.jobs" :key="job.id">
            <td><strong>{{ job.empresa }}</strong></td>
            <td>{{ job.puesto }}</td>
            <td>
              <select 
                :value="job.estado" 
                @change="handleUpdateStatus(job, ($event.target as HTMLSelectElement).value)"
                :class="formatClass(job.estado)"
              >
                <option v-for="estado in estadosPosibles" :key="estado" :value="estado">
                  {{ estado }}
                </option>
              </select>
            </td>
            <td>
              <button class="btn-delete" @click="store.deleteJob(job.id!)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!store.loading && store.jobs.length === 0" class="empty-msg">
        No hay candidaturas registradas todavía.
      </p>
    </section>
  </div>
</template>

<style scoped>
.job-container { max-width: 900px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.title { text-align: center; color: #2c3e50; margin-bottom: 30px; }

.form-card { background: #f8f9fa; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px; }
.form-card h3 { margin-top: 0; color: #34495e; font-size: 1.1rem; }

.form-group { display: flex; gap: 12px; }
input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }

/* El botón verde que querías */
.btn-add { 
  background-color: #42b883; 
  color: white; 
  border: none; 
  padding: 12px 20px; 
  border-radius: 8px; 
  font-weight: bold; 
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add:hover { background-color: #33a06f; }
.btn-add:disabled { background-color: #bdc3c7; cursor: not-allowed; }

.job-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #7f8c8d; }
td { padding: 15px 12px; border-bottom: 1px solid #f1f1f1; }

select { padding: 8px; border-radius: 6px; border: 1px solid #ddd; width: 100%; cursor: pointer; }
.btn-delete { background: #ff4d4d; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
.btn-delete:hover { background: #e03131; }

/* Clases de estado dinámicas */
.cv-enviado { border-left: 4px solid #3498db; background: #ebf5fb; }
.entrevista-técnica { border-left: 4px solid #f1c40f; background: #fef9e7; }
.rechazado { border-left: 4px solid #e74c3c; background: #fdedec; }
.oferta-recibida { border-left: 4px solid #2ecc71; background: #eafaf1; }

.loader { text-align: center; padding: 20px; color: #3498db; font-weight: bold; }
.empty-msg { text-align: center; color: #95a5a6; margin-top: 20px; }
</style>