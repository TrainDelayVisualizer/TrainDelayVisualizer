import React, { useEffect, useRef, RefObject, useState, useLayoutEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, Popup, Marker } from "react-leaflet";
import { Progress } from "antd";
import StationView from "../station/StationView";
import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { fetchStations, Station } from "../../store/stationSlice"
import "./Map.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Layout, FloatButton, Drawer, Button } from "antd";
import { MenuOutlined, EnvironmentOutlined, AppstoreOutlined, CloseOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import TableContainer from "../table/TableContainer";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [windowWidth, setWidth] = useState(window.innerWidth);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);

  const stations = useAppSelector((state) => state.station.all)
  const dispatch = useAppDispatch()

  function onShowLines(station: Station) {
    console.log(station);
    setCurrentStation(station);
    setDrawerOpen(true);
  }

  function toggleMap () {
    setShowMap(!showMap);
  }

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

  useLayoutEffect(() => {
    function updateSize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const siderWidth = windowWidth > 600 ? 600 : "100%";

  let content =  <MapContainer
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
        <p>{station.lat.toFixed(4)}, {station.lon.toFixed(4)}</p>
        <Button onClick={() => onShowLines(station)}>Show Lines</Button>
      </Popup>
    </Marker>)}
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
    />
  </MapContainer>;

  if(!showMap){
    content = <TableContainer />;
  }

  return (
    <Layout>
      <Drawer
        title=""
        placement="left"
        closable={true}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        getContainer={false}
        width={siderWidth}
      >
        {currentStation && <StationView station={currentStation}/>}
            <Button
                className="close-button"
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setDrawerOpen(false)}
            />
      </Drawer>
      <FloatButton
          style={{ visibility: showMap ? "visible" : "hidden" }}
        className="menu-button"
        type="primary" onClick={() => setDrawerOpen(!drawerOpen)}
        icon={<MenuOutlined />}>
      </FloatButton>
      <div className="loading-overlay" style={{ visibility: progress < 100 ? "visible" : "hidden", opacity: progress < 100 ? 1 : 0 }}>
        <Progress type="circle" percent={progress} />
      </div>
      <Layout style={{ height: showMap ? "auto" : "100vh" }}>
        <Header>
          <div className="header-content">
            <img src="/ui/logo.png" alt="logo" className="logo" />
            <Title level={2} className="title">{windowWidth > 600 ? "Train Delay Visualizer" : "TDV"}</Title>
          </div>
          <Button icon={showMap ? <AppstoreOutlined /> : <EnvironmentOutlined />} onClick={() => toggleMap()} className="toggle-button">Toggle Map</Button>
        </Header>
        <Content style={{ overflow: "auto" }}>
         {content}
        </Content>
      </Layout>
    </Layout>
  )
}

export default Map;