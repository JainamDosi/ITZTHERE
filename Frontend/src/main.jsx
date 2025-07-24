import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

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
