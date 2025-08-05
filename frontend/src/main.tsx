import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

try {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    throw new Error('Root element not found');
  }

  const container = createRoot(root);
  container.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error('Error initializing app:', error instanceof Error ? error.message : 'Unknown error');
  throw error;
}
