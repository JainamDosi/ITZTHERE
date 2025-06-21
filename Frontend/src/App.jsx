


import React, { Suspense, lazy } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './index.css'
import ITZTHERE from './pages/ITZTHERE'
import Register from './pages/Register'
import Login from './pages/Login'

const Windo_landing = lazy(() => import('./pages/Windo_landing'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ITZTHERE />} />
        <Route path="/windo" element={<Windo_landing/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )


}

export default App;
