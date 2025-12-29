import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Landing from './pages/Landing';
// import LoginPage from './pages/LoginPage';
// import SignUpPage from './pages/SignUpPage';

import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/fonts.css";

import Landing from "./components/Landing/Landing";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <div className="App">
//       <Landing />
//     </div>
//   )
// }

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
