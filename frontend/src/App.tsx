import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Test from "./components/NotFound";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/ui">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/not-found" element={<Test />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
