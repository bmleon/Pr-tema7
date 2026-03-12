<script setup lang="ts">
import { auth, githubProvider } from '../firebase';
// IMPORTANTE: Hemos añadido GithubAuthProvider aquí para solucionar el error de TS
import { signInWithPopup, signOut, GithubAuthProvider } from 'firebase/auth';
import { useAuthStore } from '../stores/authStore';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { token } = storeToRefs(authStore);

// Función para iniciar sesión con GitHub
const loginWithGitHub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    
    // CORRECCIÓN TS: Acceso al método estático GithubAuthProvider
    const credential = GithubAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (accessToken) {
      authStore.login(accessToken); // Guardamos el Bearer Token en Pinia
      alert("¡Login exitoso con GitHub!");
    }
  } catch (error: any) {
    console.error("Error en el login:", error);
    alert("Error al autenticar: " + error.message);
  }
};

const handleLogout = () => {
  signOut(auth);
  authStore.logout();
};
</script>

<template>
  <div class="dashboard-container">
    <h2 class="title">🔐 GitHub DevHub - Panel Seguro</h2>

    <div v-if="!token" class="login-card">
      <p>Debes identificarte para acceder a las funciones seguras de la aplicación.</p>
      <button class="btn-github" @click="loginWithGitHub">
        <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GH" class="icon" />
        Iniciar sesión con GitHub
      </button>
      <p class="hint">Esto guardará un token Bearer en el store de Pinia.</p>
    </div>

    <div v-else class="auth-card">
      <div class="success-badge">✅ Sesión Activa</div>
      <h3>Bienvenido al Panel Privado</h3>
      <p>Tu Token de GitHub está inyectándose automáticamente en las cabeceras de Axios gracias a los Interceptores.</p>
      
      <div class="token-display">
        <strong>Token de Acceso (Pinia):</strong>
        <code>{{ token.substring(0, 25) }}...</code>
      </div>

      <button class="btn-logout" @click="handleLogout">Cerrar Sesión</button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
.title { color: #2c3e50; margin-bottom: 30px; font-weight: 800; }

.login-card, .auth-card { 
  background: white; 
  padding: 40px; 
  border-radius: 15px; 
  box-shadow: 0 10px 25px rgba(0,0,0,0.05); 
  border: 1px solid #eee; 
}

.btn-github { 
  background: #24292e; 
  color: white; 
  border: none; 
  padding: 14px 28px; 
  border-radius: 8px; 
  font-weight: bold; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin: 20px auto; 
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-github:hover { 
  transform: translateY(-2px); 
  background: #000; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.icon { width: 22px; filter: invert(1); }

.hint { font-size: 0.85rem; color: #95a5a6; margin-top: 15px; }

.success-badge { 
  background: #e8f5e9; 
  color: #2e7d32; 
  padding: 8px 16px; 
  border-radius: 20px; 
  display: inline-block; 
  font-weight: bold; 
  margin-bottom: 15px; 
}

.token-display { 
  background: #f8f9fa; 
  padding: 15px; 
  border-radius: 8px; 
  margin: 25px 0; 
  border: 1px solid #ddd; 
  text-align: left;
}

.token-display strong { display: block; margin-bottom: 5px; font-size: 0.9rem; color: #7f8c8d; }

code { 
  word-break: break-all; 
  color: #e83e8c; 
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
}

.btn-logout { 
  background: transparent; 
  color: #e74c3c; 
  border: 2px solid #e74c3c; 
  padding: 10px 20px; 
  border-radius: 8px; 
  cursor: pointer; 
  margin-top: 10px; 
  font-weight: bold;
  transition: all 0.2s;
}

.btn-logout:hover { 
  background: #e74c3c; 
  color: white; 
}
</style>