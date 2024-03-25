import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Map from "./components/map/Map";
import Test from "./components/NotFound";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/ui">
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/not-found" element={<Test />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
