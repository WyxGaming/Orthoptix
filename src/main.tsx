import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { preloadModelesTete } from './scene/TetePatient';
import { urlsModelesTete } from './scene/modeles-tete';
import './index.css';

preloadModelesTete(urlsModelesTete());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
