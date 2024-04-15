import React, { useEffect, useRef, RefObject, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Popup, Marker } from "react-leaflet";
import { Progress } from 'antd';
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { fetchStations, Station } from '../../store/stationSlice'
import "./Map.css";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { Layout, FloatButton, Drawer, Button } from 'antd';
import { MenuOutlined, EnvironmentOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Title } = Typography;

const { Header, Content } = Layout;

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

function Map() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef: RefObject<any> = useRef();
  const [progress, setProgress] = useState(0);
  const [collapsed, setCollapsed] = useState(true);
  const [showMap, setShowMap] = useState(true);

  const stations = useAppSelector((state) => state.station.all)
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

  const siderWidth = "40%";
  return (
    <Layout>
      <Drawer
        title=""
        placement="left"
        closable={true}
        onClose={() => setCollapsed(true)}
        open={!collapsed}
        getContainer={false}
        width={siderWidth}
      >
        <p>Some contents...</p>
      </Drawer>
      <FloatButton
        className='menu-button'
        type="primary" onClick={() => setCollapsed(!collapsed)}
        icon={<MenuOutlined />}>
        {collapsed ? "Show" : "Hide"} Sidebar
      </FloatButton>
      <div className="loading-overlay" style={{ visibility: progress < 100 ? "visible" : "hidden", opacity: progress < 100 ? 1 : 0 }}>
        <Progress type="circle" percent={progress} />
      </div>
      <Layout>
        <Header>
          <div className="header-content">
            <img src="/ui/logo.png" alt="logo" className="logo" />
            <Title level={2} className="title">Train Delay Visualizer</Title>
          </div>
          <Button icon={showMap ? <AppstoreOutlined /> : <EnvironmentOutlined />} onClick={() => setShowMap(!showMap)} className="toggle-button">Toggle Map</Button>
        </Header>
        <Content>
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
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
          </MapContainer>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Map;