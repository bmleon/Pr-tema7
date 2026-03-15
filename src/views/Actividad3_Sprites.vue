<script setup lang="ts">
import { ref } from 'vue';

const prompt = ref('');
const frames = ref(4); // ¡Tus frames han vuelto!
const imageUrl = ref<string | null>(null);
const loading = ref(false);
const errorMsg = ref('');

const generateSprite = async () => {
  if (!prompt.value) return;

  loading.value = true;
  errorMsg.value = '';
  imageUrl.value = null;

  try {
    const token = import.meta.env.VITE_HF_API_KEY.trim();
    
    // Añadimos la indicación de los frames al texto que le pasamos a la IA
    const textoIA = `${prompt.value}, spritesheet, ${frames.value} frames, pixel art`;

    // Llamamos a nuestro proxy
    const response = await fetch("/hf-api/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: textoIA })
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const blob = await response.blob();
    imageUrl.value = URL.createObjectURL(blob);
    
  } catch (error: any) {
    console.error("Detalle del error exacto:", error);
    errorMsg.value = "Error 404: Vercel no encuentra la ruta. Revisa que vercel.json esté en la raíz del proyecto.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="sprite-container">
    <h2 class="title">👾 Generador de Sprites (IA)</h2>
    
    <div class="controls-group">
      <input
        v-model="prompt"
        type="text"
        placeholder="Ej: un perro astronauta..."
        @keyup.enter="generateSprite"
        :disabled="loading"
        class="prompt-input"
      />
      
      <div class="frames-selector">
        <label>Frames:</label>
        <input 
          v-model="frames" 
          type="number" 
          min="1" 
          max="12" 
          :disabled="loading"
        />
      </div>

      <button @click="generateSprite" :disabled="loading || !prompt">
        {{ loading ? 'Generando...' : 'Crear Sprite' }}
      </button>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="image-wrapper">
      <div v-if="loading" class="loader">Pintando {{ frames }} píxeles mágicos... 🎨</div>
      <img v-else-if="imageUrl" :src="imageUrl" alt="Sprite generado" class="generated-image" />
      <div v-else class="placeholder">Tu sprite aparecerá aquí</div>
    </div>
  </div>
</template>

<style scoped>
.sprite-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.title {
  color: #2c3e50;
  margin-bottom: 20px;
}
.controls-group {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.prompt-input {
  flex: 2;
  min-width: 250px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
}
.frames-selector {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
}
.frames-selector input {
  width: 60px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}
button {
  padding: 12px 20px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
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
}
.generated-image {
  max-width: 100%;
  border-radius: 8px;
}
.placeholder, .loader {
  color: #95a5a6;
  font-style: italic;
}
</style>