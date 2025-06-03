import { useState } from 'react'
import AppNavbar from './components/navbar'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Routes, Route } from 'react-router-dom'


function App() {

  return (
    <>
      <AppNavbar />
      <Routes>
        <Route path="/" element={
          <div className="container mt-4">
            <h1>Welcome to Dream Weaver</h1>
            <p>Your mindfulness and sleep improvement app.</p>
          </div>
        } />
      </Routes>
    </>
  )
}

export default App
