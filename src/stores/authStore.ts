import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Intentamos recuperar el token del localStorage por si el usuario refresca la página
  const token = ref<string | null>(localStorage.getItem('token'));

  function login(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function logout() {
    token.value = null;
    localStorage.removeItem('token');
  }

  return { token, login, logout };
});