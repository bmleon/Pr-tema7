import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";

// Configuración obtenida de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDnMddDR32tQBjd5dDXwpoLrfFIHKc3-Ns",
  authDomain: "jobtracker-d59b4.firebaseapp.com",
  projectId: "jobtracker-d59b4",
  storageBucket: "jobtracker-d59b4.firebasestorage.app",
  messagingSenderId: "542442876600",
  appId: "1:542442876600:web:c642b74aa115ebdd180e4d",
  measurementId: "G-NMT00Z4PND"
};

// Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas de autenticación para usarlas en Actividad4_Dashboard.vue
export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();