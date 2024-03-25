import React from 'react';
import { MapContainer, TileLayer } from "react-leaflet";
import "./Map.css";
import "leaflet/dist/leaflet.css";

function Map() {

  console.log("hio")
  return (
    <div className="App">
       <MapContainer
      className="map-container"
      center={[47.2266, 8.81845]}
      zoom={11}
      maxZoom={18}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

    </MapContainer>
    </div>
  )
}

export default Map;