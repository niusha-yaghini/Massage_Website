import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Landing from './components/Landing/Landing';

import 'bootstrap/dist/css/bootstrap.rtl.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import './styles/fonts.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Landing />
    </div>
  )
}

export default App
