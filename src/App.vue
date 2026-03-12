<script setup lang="ts">
import { ref } from 'vue'
import Actividad1_Jobs from './views/Actividad1_Jobs.vue'
import Actividad2_UML from './views/Actividad2_UML.vue'
import Actividad3_Sprites from './views/Actividad3_Sprites.vue'
import Actividad4_Dashboard from './views/Actividad4_Dashboard.vue'

// Estado para controlar qué actividad se muestra en pantalla
const vistaActual = ref(1)
</script>

<template>
  <header>
    <nav class="navbar">
      <div class="nav-title">Práctica 7.1 - DWECL</div>
      <div class="nav-buttons">
        <button @click="vistaActual = 1" :class="{ active: vistaActual === 1 }">
          Act. 1 (Jobs)
        </button>
        <button @click="vistaActual = 2" :class="{ active: vistaActual === 2 }">
          Act. 2 (IA UML)
        </button>
        <button @click="vistaActual = 3" :class="{ active: vistaActual === 3 }">
          Act. 3 (Sprites)
        </button>
        <button @click="vistaActual = 4" :class="{ active: vistaActual === 4 }" class="btn-auth">
          Act. 4 (Auth)
        </button>
      </div>
    </nav>
  </header>

  <main class="container">
    <transition name="fade" mode="out-in">
      <div :key="vistaActual">
        <Actividad1_Jobs v-if="vistaActual === 1" />
        <Actividad2_UML v-if="vistaActual === 2" />
        <Actividad3_Sprites v-if="vistaActual === 3" />
        <Actividad4_Dashboard v-if="vistaActual === 4" />
      </div>
    </transition>
  </main>
</template>

<style>
/* Estilos Globales */
:root {
  --primary: #42b883;
  --secondary: #35495e;
  --dark: #2c3e50;
  --light: #ecf0f1;
  --accent: #8e44ad;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f8f9fa;
  color: var(--dark);
}

/* Barra de navegación profesional */
.navbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--dark);
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.nav-title {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
  letter-spacing: 1px;
}

.nav-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

nav button {
  padding: 10px 18px;
  cursor: pointer;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

nav button:hover {
  background: rgba(255, 255, 255, 0.2);
}

nav button.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 0 15px rgba(66, 184, 131, 0.4);
}

/* Botón especial para la Actividad de Seguridad */
.btn-auth.active {
  background: #3498db !important;
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.4);
}

/* Contenedor principal */
.container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

/* Animación de transición suave entre vistas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .nav-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }
}
</style>