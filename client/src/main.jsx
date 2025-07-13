import React, { useContext, useEffect, useState, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import Playlists from './Playlists';
import Settings from './Settings';
import axios from 'axios';
import { AuthContext, AuthProvider } from './context/AuthContext'
import { PlaylistContext, PlaylistProvider } from './context/PlaylistContext'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';

axios.defaults.withCredentials = true

const root = ReactDOM.createRoot(document.getElementById('root'));

let validity_r;

let nodeBackendUrl = import.meta.env.VITE_NODE_BACKEND_URL












const ProtectedRoutes = () => {
  const { loggedIn, setLoggedIn, logout } = useContext(AuthContext)

  if(loggedIn === null)
  {
    return <></>
  }
  return (loggedIn ? <Outlet /> : <Navigate to="/login" />)
}


root.render(
  
  <Router>
    <AuthProvider>
    <PlaylistProvider>
    <Routes>
      <Route path="/" element={ <Home /> } />
      <Route path="/login" element={ <Login /> } /> 
      <Route path="/registration" element={ <Register /> } />
      <Route element={ <ProtectedRoutes /> }>
        <Route path="/playlists" element={ <Playlists /> } />
        <Route path="/settings" element={ <Settings /> } />
      </Route>
    </Routes>
    </PlaylistProvider>
    </AuthProvider>
  </Router>
  
);


