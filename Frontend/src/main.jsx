import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import axios from "axios";
axios.defaults.withCredentials = true;
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.jsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
  </StrictMode>,
)
