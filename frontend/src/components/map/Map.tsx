import React, { useEffect, useRef, RefObject } from 'react';
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "./Map.css";
import "leaflet/dist/leaflet.css";

function MapController() {
  const mapEvents = useMapEvents({
    zoomend: () => {
      console.log("zoom", mapEvents.getZoom());
    },
    moveend: () => {
      console.log("pan", mapEvents.getCenter(), mapEvents.getBounds());
    }
  });

  return null
}

function Map() {
  const mapRef: RefObject<any> = useRef();

  useEffect(() => {
    function getLocation(): void {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = [position.coords.latitude, position.coords.longitude];
          mapRef.current.setView(pos, mapRef.current.getZoom());
        });
      }
    }
    getLocation();
  }, []);

  return (
    <div className="App">
      <MapContainer
        ref={mapRef}
        className="map-container"
        center={[47.2266, 8.81845]}
        zoom={12}
        maxZoom={13}
        minZoom={10}
      >
        <MapController />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  )
}

export default Map;