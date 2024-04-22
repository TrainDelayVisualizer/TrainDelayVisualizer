import React, { useEffect, useRef, RefObject, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Popup, Marker } from "react-leaflet";
import { Progress } from 'antd';
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { fetchStations, Station } from '../../store/stationSlice'
import { fetchSections } from '../../store/sectionSlice'
import { Hotline, HotlineOptions, Palette, HotlineProps } from 'react-leaflet-hotline';
import "./Map.css";
import "leaflet/dist/leaflet.css";
import { JSX } from 'react';
import L from 'leaflet';


const icon = L.icon({
  iconUrl: "/ui/marker.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 20]
});

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

function HotlineWrapper<T>({ data, getLat, getLng, getVal, options, eventHandlers }: HotlineProps<T>): JSX.Element {
  // Call the original Hotline component and return its result
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <Hotline
      data={data}
      getLat={getLat}
      getLng={getLng}
      getVal={getVal}
      options={options}
      eventHandlers={eventHandlers}
    />
  );
}

const data = [
  { lat: 47.2266, lng: 8.81845, value: 1 },
  { lat: 47.1, lng: 8.9, value: 2 },
  { lat: 47.4, lng: 8.8, value: 3 },
  { lat: 47.3, lng: 8.7, value: 4 },
  { lat: 47.3, lng: 8.9, value: 4 },
  { lat: 47.4, lng: 8.9, value: 4 },
]

export const palette_0: Palette = [
  { r: 0, g: 160, b: 0, t: 0 },
  { r: 255, g: 255, b: 0, t: 0.5 },
  { r: 255, g: 0, b: 0, t: 1 }
]

const options: HotlineOptions = {
  min: 1,
  max: 8,
  outlineWidth: 0,
  outlineColor: 'black',
  weight: 7,
  palette: palette_0,
  tolerance: 3
}

function Map() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef: RefObject<any> = useRef();
  const [progress, setProgress] = useState(0);

  const stations = useAppSelector((state) => state.station.all)
  const sections = useAppSelector((state) => state.section.all)
  const dispatch = useAppDispatch()

  console.log("Sections: " + sections);

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

        <HotlineWrapper
          key={123}
          data={data}
          getLat={t => t.lat}
          getLng={t => t.lng}
          getVal={t => t.value}
          options={{ ...options, tolerance: 10 }} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  )
}

export default Map;