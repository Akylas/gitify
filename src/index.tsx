import * as React from 'react';
import {createRoot} from 'react-dom/client';

import 'tailwindcss/tailwind.css';
import 'nprogress/nprogress.css';

import { App } from './app';

createRoot(document.getElementById('root')!).render(
    <App />
  )