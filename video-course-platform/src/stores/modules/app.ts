import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(false);
  const showTabs = ref(true);
  const theme = ref<'light' | 'dark'>('light');

  // Actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme;
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }

  return {
    sidebarCollapsed,
    showTabs,
    theme,
    toggleSidebar,
    setTheme,
  };
});
