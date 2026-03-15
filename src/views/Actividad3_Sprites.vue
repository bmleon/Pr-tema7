<script setup lang="ts">
import { ref } from 'vue';

const prompt = ref('');
const imageUrl = ref<string | null>(null);
const loading = ref(false);
const errorMsg = ref('');

const generateSprite = async () => {
  if (!prompt.value) return;

  loading.value = true;
  errorMsg.value = '';
  imageUrl.value = null;

  try {
    // 1. Obtenemos la clave de Vercel (que ya comprobamos que funciona)
    const token = import.meta.env.VITE_HF_API_KEY;

    // 2. 🚀 EL TOQUE MÁGICO: Llamamos a nuestra propia web (/hf-api/...) 
    // y el archivo vercel.json se encargará de enviarlo a Hugging Face sin que salte el CORS.
    const response = await fetch("/hf-api/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt.value })
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }

    // 3. Convertimos la respuesta binaria en una imagen visible
    const blob = await response.blob();
    imageUrl.value = URL.createObjectURL(blob);
    
  } catch (error: any) {
    console.error("Detalle del error exacto:", error);
    errorMsg.value = "Error al generar la imagen. Verifica tu conexión.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="sprite-container">
    <h2 class="title">👾 Generador de Sprites (IA)</h2>
    <div class="input-group">
      <input
        v-model="prompt"
        type="text"
        placeholder="Ej: un perro astronauta en estilo pixel art..."
        @keyup.enter="generateSprite"
        :disabled="loading"
      />
      <button @click="generateSprite" :disabled="loading || !prompt">
        {{ loading ? 'Generando...' : 'Crear Sprite' }}
      </button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="image-wrapper">
      <div v-if="loading" class="loader">Pintando píxeles mágicos... 🎨</div>
      <img v-else-if="imageUrl" :src="imageUrl" alt="Sprite generado" class="generated-image" />
      <div v-else class="placeholder">
        Tu sprite aparecerá aquí
      </div>
    </div>
  </div>
</template>

<style scoped>
.sprite-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.title {
  color: #2c3e50;
  margin-bottom: 20px;
}
.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}
input:focus {
  border-color: #42b883;
}
button {
  padding: 12px 20px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}
button:hover:not(:disabled) {
  background-color: #3aa876;
}
button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}
.error-msg {
  color: #e74c3c;
  background-color: #fce4e4;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6c6;
}
.image-wrapper {
  min-height: 350px;
  border: 2px dashed #ccc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fdfdfd;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
}
.generated-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.placeholder, .loader {
  color: #95a5a6;
  font-style: italic;
}
</style>