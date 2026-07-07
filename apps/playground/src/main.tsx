import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral';

import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import './components/slider.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme theme={neutralTheme} mode="system">
      <App />
    </Theme>
  </StrictMode>
);
