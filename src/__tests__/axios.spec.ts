import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import MockAdapter from 'axios-mock-adapter';
import { jobApi } from '../api/axios'; // Usamos una de tus instancias de axios
import { useAuthStore } from '../stores/authStore';

// Creamos el simulador (Mock) para interceptar las llamadas de Axios
const mock = new MockAdapter(jobApi);

describe('Pruebas Unitarias: Interceptores de Axios (Actividad 4)', () => {
  
  beforeEach(() => {
    // Inicializamos Pinia en cada test
    setActivePinia(createPinia());
    // Limpiamos los mocks previos
    mock.reset();
    // Simulamos el alert de la ventana para que el test no se detenga
    vi.stubGlobal('alert', vi.fn());
  });

  it('debe inyectar el token en la cabecera Authorization si existe en Pinia', async () => {
    const authStore = useAuthStore();
    const tokenFalso = 'abc-123-token-github';
    authStore.login(tokenFalso);

    // Simulamos cualquier respuesta exitosa
    mock.onGet('/test').reply(200);

    const response = await jobApi.get('/test');

    // Verificamos que la petición que salió llevaba el token
    expect(response.config.headers?.Authorization).toBe(`Bearer ${tokenFalso}`);
  });

  it('PRUEBA OBLIGATORIA: debe borrar el token de Pinia cuando la API devuelve un error 401', async () => {
    const authStore = useAuthStore();
    authStore.login('token-que-va-a-caducar');

    // 1. Simulamos que la API responde con un 401 (Unauthorized)
    mock.onGet('/jobs').reply(401);

    try {
      // 2. Intentamos hacer la petición
      await jobApi.get('/jobs');
    } catch (error) {
      // Es normal que entre aquí porque el 401 es un error
    }

    // 3. VERIFICACIÓN: El interceptor de respuesta debe haber ejecutado logout()
    // Por tanto, el token en el store de Pinia debe ser null ahora
    expect(authStore.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});