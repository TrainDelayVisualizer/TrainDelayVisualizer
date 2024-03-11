import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/*<Route path="/about" element={<About />} />*/}
        {/*<Route path="/work" element={<Work />} />*/}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
