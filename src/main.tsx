import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Initialize app
const initializeApp = () => {
  // Set initial theme based on system preference
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  }

  // Setze den Titel der Seite
  document.title = 'eb-due - Dienststellen und Einrichtungen Baden-Württemberg';
  
  // Aktualisiere Meta-Beschreibung
  const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (metaDescription) {
    metaDescription.content = 'eb-due - Professionelle Routing-Anwendung für Dienststellen und Einrichtungen in Baden-Württemberg. Präzise Navigation zu allen Standorten mit Multi-Provider Routing-Technologie.';
  }

  // Aktualisiere Apple Mobile Web App Title
  const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement | null;
  if (appleTitle) {
    appleTitle.content = 'eb-due';
  }

  // Setze Theme Color
  const themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (themeColor) {
    themeColor.content = '#1e40af';
  }

  // Add meta viewport for mobile optimization
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  document.head.appendChild(metaViewport);

  // Add meta for PWA
  const metaThemeColor = document.createElement('meta');
  metaThemeColor.name = 'theme-color';
  metaThemeColor.content = '#1e40af';
  document.head.appendChild(metaThemeColor);

  console.log('🚓 eb-due - Dienststellen und Einrichtungen Baden-Württemberg');
  console.log('🎯 Präzise Routing-Technologie initialisiert');
  console.log('🌍 Baden-Württemberg Fokus aktiviert');
  console.log('⚡ Multi-Provider Routing bereit');
};

// Initialize the app
initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
