<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { iaApi } from '../api/axios';
import mermaid from 'mermaid';

onMounted(() => {
  mermaid.initialize({ startOnLoad: false, theme: 'forest' });
});

const prompt = ref('');
const diagramOutput = ref<HTMLElement | null>(null);
const loading = ref(false);
const errorMsg = ref('');
const showDownload = ref(false);
let controller: AbortController | null = null;

const generateDiagram = async () => {
  if (!prompt.value) return;
  loading.value = true;
  errorMsg.value = '';
  showDownload.value = false;
  controller = new AbortController();

  try {
    const response = await iaApi.post('/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a Mermaid.js code generator. Return ONLY the raw valid Mermaid code. DO NOT wrap the code in markdown (```). DO NOT say 'Here is your diagram' or any other conversational text. Start directly with the diagram type (e.g., 'graph TD', 'sequenceDiagram', or 'flowchart LR')."
        },
        { role: "user", content: prompt.value }
      ]
    }, { signal: controller.signal });

    // Obtenemos el texto de la IA
    let code = response.data.choices[0].message.content;
    
    // Lo imprimimos en consola para ver qué ha respondido exactamente
    console.log("Respuesta bruta de la IA:", code);

    // Limpiamos cualquier rastro de comillas markdown o basura
    code = code.replace(/```mermaid/gi, "").replace(/```/g, "").trim();

    // Se lo pasamos a Mermaid para que lo dibuje
    await renderDiagram(code);
    showDownload.value = true;
    
  } catch (err: any) {
    if (err.name === 'AbortError') {
      errorMsg.value = "Generación cancelada por el usuario.";
    } else {
      errorMsg.value = "Error: La IA no devolvió un código UML válido o falló la conexión.";
      console.error("Detalle del error:", err);
    }
  } finally {
    loading.value = false;
  }
};

const cancelAction = () => {
  if (controller) {
    controller.abort();
  }
};

const renderDiagram = async (code: string) => {
  if (diagramOutput.value) {
    diagramOutput.value.innerHTML = '';
    try {
      // Generamos un ID único para cada renderizado y evitar colisiones
      const id = 'graph-' + Math.random().toString(36).substr(2, 9);
      const { svg } = await mermaid.render(id, code);
      diagramOutput.value.innerHTML = svg;
    } catch (e) {
      console.error("Error de renderizado Mermaid:", e);
      errorMsg.value = "Mermaid no pudo interpretar el código generado. Revisa la consola.";
    }
  }
};

const downloadDiagram = () => {
  const svg = diagramOutput.value?.querySelector('svg');
  if (svg) {
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagrama-ia.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
</script>

<template>
  <div class="ia-container">
    <h2 class="title">🎨 AI-UML Architect</h2>
    <textarea 
      v-model="prompt" 
      placeholder="Ej: Diagrama de flujo de un proceso de inicio de sesión..."
    ></textarea>
    
    <div class="btns">
      <button @click="generateDiagram" :disabled="loading || !prompt" class="gen">
        {{ loading ? 'IA Trabajando...' : 'Generar Diagrama' }}
      </button>
      <button v-if="loading" @click="cancelAction" class="can">Detener</button>
      <button v-if="showDownload" @click="downloadDiagram" class="dow">Descargar .SVG</button>
    </div>

    <div v-if="errorMsg" class="err">{{ errorMsg }}</div>
    
    <div class="canvas-wrapper">
      <div ref="diagramOutput" class="canvas">
        <p v-if="!loading && !showDownload && !errorMsg" class="placeholder-text">
          El diagrama generado aparecerá aquí...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ia-container { padding: 20px; max-width: 900px; margin: 0 auto; font-family: sans-serif; }
.title { text-align: center; color: #2c3e50; margin-bottom: 20px; }
textarea { width: 100%; height: 120px; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-size: 16px; resize: vertical; box-sizing: border-box; }
.btns { display: flex; gap: 10px; margin: 15px 0; }
button { padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; color: white; font-weight: bold; transition: background 0.2s; }
button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
.gen { background: #4a90e2; }
.gen:hover:not(:disabled) { background: #357abd; }
.can { background: #e74c3c; }
.can:hover { background: #c0392b; }
.dow { background: #27ae60; }
.dow:hover { background: #219150; }
.err { color: #e74c3c; background: #fdedec; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; }
.canvas-wrapper { border: 2px dashed #ccc; background: #f9f9f9; min-height: 400px; display: flex; align-items: center; justify-content: center; overflow: auto; border-radius: 10px; padding: 20px; }
.canvas { width: 100%; display: flex; justify-content: center; }
.placeholder-text { color: #95a5a6; font-style: italic; }
</style>