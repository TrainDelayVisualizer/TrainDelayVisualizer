import React, { useEffect, useRef, RefObject, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Popup, Marker } from "react-leaflet";
import { Progress } from 'antd';
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { fetchStations, Station } from '../../store/stationSlice'
import { fetchSections, Section } from '../../store/sectionSlice'
import { Hotline } from 'leaflet-hotline-react';
import "./Map.css";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';


const icon = L.icon({
  iconUrl: "/ui/marker.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 20]
});

const DELAY_MINUTES_THRESHOLD_GREEN = 0.0;
const DELAY_MINUTES_THRESHOLD_RED = 2.0;

function MapController() {
  const mapEvents = useMapEvents({
    zoomend: () => {
      //TODO: update region for new zoom level
      console.log("zoom", mapEvents.getBounds());
    },
    moveend: () => {
      //TODO: update region for new position
      console.log("pan", mapEvents.getBounds());
    }
  });

  return null
}

function Map() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef: RefObject<any> = useRef();
  const [progress, setProgress] = useState(0);

  const stations = useAppSelector((state) => state.station.all)
  const sections = useAppSelector((state) => state.section.all)
  const dispatch = useAppDispatch()

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

  useEffect(() => {
    dispatch(fetchStations());
    dispatch(fetchSections());
  }, [dispatch]);

  useEffect(() => {
    let currTimeout: NodeJS.Timeout;
    function updateProgress(curr: number = 0) {
      const newProgress = curr < 92 ? curr + 8 + Math.floor(Math.random() * 12) : 100;
      setProgress(newProgress);
      if (curr < 100) {
        currTimeout = setTimeout(() => {
          updateProgress(newProgress)
        }, 300 + Math.floor(Math.random() * 200));
      }
    }
    updateProgress();
    return () => clearTimeout(currTimeout);
  }, []);

  return (
    <div className="App">
      <div className="loading-overlay" style={{ visibility: progress < 100 ? "visible" : "hidden", opacity: progress < 100 ? 1 : 0 }}>
        <Progress type="circle" percent={progress} />
      </div>
      <MapContainer
        ref={mapRef}
        className="map-container"
        center={[47.2266, 8.81845]}
        zoom={12}
        maxBounds={[
          [45.8, 5.9],
          [47.85, 10.5]
        ]}
        maxZoom={13}
        minZoom={10}
      >
        <MapController />
        {stations.map((station: Station) => <Marker position={[station.lat, station.lon]} icon={icon} key={station.id}>
          <Popup>
            <h3>{station.description}</h3>
            {station.lat.toFixed(4)}, {station.lon.toFixed(4)}
          </Popup>
        </Marker>)}
        {sections.map((section: Section) => (
          <Hotline
            key={section.stationFrom.id.toString() + section.stationTo.id.toString()}
            positions={[
              [section.stationFrom.lat, section.stationFrom.lon, section.averageDepartureDelay],
              [section.stationTo.lat, section.stationTo.lon, section.averageArrivalDelay],
            ]}
            weight={1}
            min={DELAY_MINUTES_THRESHOLD_GREEN}
            max={DELAY_MINUTES_THRESHOLD_RED}
            palette={{
              0.0: 'green',
              0.5: 'orange',
              1.0: 'red',
            }}
          />
        ))}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  )
}

export default Map;