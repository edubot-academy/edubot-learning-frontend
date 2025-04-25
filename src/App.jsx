import React from 'react'
import './App.css'
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </>
  )
}

export default App
