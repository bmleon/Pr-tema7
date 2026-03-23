<script setup lang="ts">
import { ref } from 'vue';
import { hfApi } from '../api/axios';

const prompt = ref('');
const imageUrl = ref<string | null>(null);
const loading = ref(false);
const progress = ref(0);
const errorMsg = ref('');
const frames = ref(4);

const generateSprite = async () => {
  if (!prompt.value) return;
  
  loading.value = true;
  errorMsg.value = '';
  progress.value = 0;
  imageUrl.value = null;

  try {
    const textoIA = `${prompt.value}, 2d game sprite sheet, pixel art, sequence, white background, character design`;

    const response = await hfApi.post(
      'black-forest-labs/FLUX.1-schnell',
      { inputs: textoIA },
      {
        responseType: 'blob',
        headers: {
          'Accept': 'image/jpeg'
        },
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          } else {
            progress.value = progress.value >= 90 ? 90 : progress.value + 10;
          }
        }
      }
    );

    progress.value = 100;
    imageUrl.value = URL.createObjectURL(response.data);

  } catch (err: any) {
    console.error("Error al generar sprite:", err);
    
    if (err.response?.data instanceof Blob) {
      const errorText = await err.response.data.text();
      try {
        const jsonError = JSON.parse(errorText);
        errorMsg.value = `Error HF: ${jsonError.error}`;
      } catch (e) {
        errorMsg.value = `Error servidor: ${errorText}`;
      }
    } else {
      errorMsg.value = "Error al conectar. Verifica tu conexión o el token.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="sprite-container">
    <h2 class="title">👾 SpriteSheet AI Forge</h2>
    <p class="subtitle">Describe tu personaje y el número de frames para animarlo.</p>

    <div class="input-area">
      <input 
        v-model="prompt" 
        class="prompt-input"
        placeholder="Ej: Un ninja de fuego corriendo..." 
        :disabled="loading"
        @keyup.enter="generateSprite"
      />
      
      <div class="frames-control">
        <label for="frames">Frames:</label>
        <input 
          id="frames"
          v-model.number="frames" 
          type="number" 
          min="1" 
          max="20" 
          class="frames-input"
          :disabled="loading"
        />
      </div>

      <button class="btn-forge" @click="generateSprite" :disabled="loading || !prompt">
        {{ loading ? 'Forjando...' : 'Forge Sprite' }}
      </button>
    </div>

    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>

    <div v-if="loading" class="progress-wrapper">
      <p class="progress-text">Generando imagen con IA... {{ progress }}%</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <div v-if="imageUrl && !loading" class="result-area">
      <div class="original-image">
        <h3>Sprite IA Descargado:</h3>
        <img :src="imageUrl" alt="Sprite generado" class="full-sprite" />
      </div>

      <div class="animation-box">
        <h3>Prueba de Animación CSS Dinámica:</h3>
        <p class="nota">La animación usa <b>{{ frames }}</b> pasos (steps) definidos por ti.</p>
        <div class="animation-preview" :style="{ backgroundImage: `url(${imageUrl})` }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sprite-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.title { text-align: center; color: #8e44ad; margin-bottom: 5px; }
.subtitle { text-align: center; color: #7f8c8d; margin-bottom: 25px; }

.input-area { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; background: #f4f4f4; padding: 15px; border-radius: 10px;}
.prompt-input { flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; }

.frames-control { display: flex; align-items: center; gap: 8px; font-weight: bold; color: #2c3e50; }
.frames-input { width: 60px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; text-align: center; }

.btn-forge { background: #8e44ad; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.3s; font-size: 16px;}
.btn-forge:hover:not(:disabled) { background: #732d91; }
.btn-forge:disabled { background: #bdc3c7; cursor: not-allowed; }

.error { color: #e74c3c; background: #fdedec; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 15px; font-weight: bold; border: 1px solid #e74c3c;}

.progress-wrapper { margin: 25px 0; text-align: center; }
.progress-text { margin-bottom: 8px; font-weight: bold; color: #2c3e50; }
.progress-bar { width: 100%; height: 22px; background: #ecf0f1; border-radius: 11px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2); }
.progress-fill { height: 100%; background: #2ecc71; transition: width 0.3s ease; }

.result-area { margin-top: 30px; display: flex; flex-direction: column; gap: 30px; align-items: center; }
.original-image, .animation-box { width: 100%; text-align: center; background: #f9f9f9; padding: 20px; border-radius: 12px; border: 1px solid #eee; }
.full-sprite { max-width: 100%; border: 2px dashed #bdc3c7; border-radius: 8px; background: white; }
.nota { font-size: 0.85em; color: #7f8c8d; font-style: italic; margin-bottom: 15px;}

.animation-preview {
  width: 128px;
  height: 128px;
  margin: 0 auto;
  border: 3px solid #2c3e50;
  border-radius: 8px;
  background-position: left center;
  background-size: cover; 
  background-color: white;
  animation: play-sprite 0.8s steps(v-bind(frames)) infinite; 
}

@keyframes play-sprite {
  from { background-position: 0 0; }
  to { background-position: calc(-128px * v-bind(frames)) 0; }
}
</style>