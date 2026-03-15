<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { iaApi } from '../api/axios';
import mermaid from 'mermaid';

onMounted(() => {
  mermaid.initialize({ 
    startOnLoad: false, 
    theme: 'forest',
    securityLevel: 'loose' 
  });
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
          content: `You are a Mermaid.js code generator. 
          Return ONLY the raw Mermaid code. 
          DO NOT use markdown blocks (code fences). 
          DO NOT include any explanation. 
          CRITICAL: Use ONLY standard syntax. For flowchart arrows, use ONLY '-->' or '==>'. 
          NEVER use symbols like '|>' or '->>'. 
          Start with 'graph TD', 'graph LR' or 'sequenceDiagram'.`
        },
        { role: "user", content: prompt.value }
      ]
    }, { signal: controller.signal });

    // Extraemos el código
    let code = response.data.choices[0].message.content;
    
    console.log("Respuesta bruta de la IA:", code);

    // Limpieza profunda de ruidos en el texto (marcas de markdown o texto extra)
    code = code.replace(/```mermaid/gi, "")
               .replace(/```/g, "")
               .replace(/^Here is your code:?/gi, "")
               .trim();

    await renderDiagram(code);
    showDownload.value = true;
    
  } catch (err: any) {
    if (err.name === 'AbortError') {
      errorMsg.value = "Generación cancelada.";
    } else {
      errorMsg.value = "Error al conectar con la IA o código no válido.";
      console.error(err);
    }
  } finally {
    loading.value = false;
  }
};

const cancelAction = () => {
  if (controller) controller.abort();
};

const renderDiagram = async (code: string) => {
  if (diagramOutput.value) {
    diagramOutput.value.innerHTML = '';
    try {
      const id = 'graph-' + Math.random().toString(36).substring(2, 11);
      const { svg } = await mermaid.render(id, code);
      diagramOutput.value.innerHTML = svg;
    } catch (e) {
      console.error("Mermaid Render Error:", e);
      errorMsg.value = "La IA generó un código que Mermaid no pudo dibujar. Intenta pedirlo de nuevo.";
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
      placeholder="Ej: Diagrama de flujo de una compra online..."
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
          Tu diagrama aparecerá aquí...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ia-container { padding: 20px; max-width: 900px; margin: 0 auto; font-family: 'Segoe UI', sans-serif; }
.title { text-align: center; color: #2c3e50; margin-bottom: 20px; }
textarea { width: 100%; height: 100px; padding: 15px; border-radius: 8px; border: 1px solid #ddd; font-size: 16px; resize: none; box-sizing: border-box; outline: none; transition: border 0.3s; }
textarea:focus { border-color: #4a90e2; }
.btns { display: flex; gap: 10px; margin: 15px 0; }
button { padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; color: white; font-weight: bold; transition: opacity 0.2s; }
button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
.gen { background: #4a90e2; }
.can { background: #e74c3c; }
.dow { background: #27ae60; }
button:hover:not(:disabled) { opacity: 0.8; }
.err { color: #e74c3c; background: #fdedec; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; border: 1px solid #fadbd8; }
.canvas-wrapper { border: 2px dashed #ccc; background: #fff; min-height: 400px; display: flex; align-items: center; justify-content: center; overflow: auto; border-radius: 10px; padding: 20px; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); }
.canvas { width: 100%; display: flex; justify-content: center; }
.placeholder-text { color: #95a5a6; font-style: italic; }
</style>