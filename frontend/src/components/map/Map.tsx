import React, { useEffect, useRef, RefObject, useState, useLayoutEffect } from "react";
import { MapContainer, TileLayer, Popup, Marker, Polyline } from "react-leaflet";
import { Progress } from "antd";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchStations } from "../../store/stationSlice";
import { fetchSections } from "../../store/sectionSlice";
import { Hotline } from "leaflet-hotline-react";
import "./Map.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { notification, Layout, FloatButton, Drawer, Button, Typography } from "antd";
import { MenuOutlined, EnvironmentOutlined, AppstoreOutlined, CloseOutlined } from "@ant-design/icons";
import TableContainer from "../table/TableContainer";
import StationView from "../station/StationView";
import FilterView from "../filter/FilterView";
import type { Station } from "../../model/Station";
import type { Section } from "../../model/Section";
import ColorLegend from "../colorLegend/ColorLegend";

const { Title } = Typography;

const { Header, Content } = Layout;

const icon = L.icon({
    iconUrl: "/ui/marker.svg",
    iconSize: [20, 20],
    iconAnchor: [10, 20]
});

const DELAY_MINUTES_THRESHOLD_GREEN = 0.0;
const DELAY_MINUTES_THRESHOLD_RED = 2.0;
const DELAY_MINUTES_THRESHOLD_GREEN_SINGLE = 0.0;
const DELAY_MINUTES_THRESHOLD_RED_SINGLE = 5.0;

function Map() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef: RefObject<any> = useRef();
    const [progress, setProgress] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [windowWidth, setWidth] = useState(window.innerWidth);
    const [currentStation, setCurrentStation] = useState<Station | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [showSingleLine, setShowSingleLine] = useState(false);

    const stations = useAppSelector((state) => state.station.all);
    const loadedSections = useAppSelector((state) => state.section.all);
    const sectionLoadingState = useAppSelector((state) => state.section.status);
    const stationLoadingState = useAppSelector((state) => state.station.status);
    const dispatch = useAppDispatch();

    const [notificationApi, contextHolder] = notification.useNotification();

    function onShowLines(station: Station) {
        setCurrentStation(station);
        setDrawerOpen(true);
    }

    useEffect(() => {
        setShowSingleLine(false);
        setSections(loadedSections);
    }, [loadedSections]);

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
        setSections(loadedSections);
    }, [loadedSections]);

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
            if (newProgress < 100) {
                setProgress(newProgress);
                currTimeout = setTimeout(() => {
                    updateProgress(newProgress);
                }, 1000 + Math.floor(Math.random() * 1000));
            }
        }
        updateProgress();
        return () => clearTimeout(currTimeout);
    }, []);

    useEffect(() => {
        if (sectionLoadingState === "idle" && stationLoadingState === "idle" && progress > 0) {
            setProgress(100);
        }
        if (sectionLoadingState === "failed" || stationLoadingState === "failed") {
            setProgress(100);
            notificationApi.error({
                key: "error-msg",
                message: "Could not load data",
                description: "Please try again later.",
                placement: "bottomRight"
            });
        }
    }, [sectionLoadingState, stationLoadingState, progress]);

    useLayoutEffect(() => {
        function updateSize() {
            setWidth(window.innerWidth);
        }
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    function showSections(sections: Section[] | null) {
        if (!sections) {
            setShowSingleLine(false);
            setSections(loadedSections);
        } else {
            setShowSingleLine(true);
            setSections(sections);
        }
    }

    let content = <MapContainer
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
        {stations.map((station: Station) => <Marker position={[station.lat, station.lon]} icon={icon} key={station.id}>
            <Popup>
                <h3>{station.description}</h3>
                {station.lat.toFixed(4)}, {station.lon.toFixed(4)}
            </Popup>
        </Marker>)}
        {sections.map((section: Section) => {
            return !section.isCancelled ? <Hotline
                key={section.stationFrom.id.toString() + section.stationTo.id.toString()}
                positions={[
                    [section.stationFrom.lat, section.stationFrom.lon, section.averageDepartureDelay],
                    [section.stationTo.lat, section.stationTo.lon, section.averageArrivalDelay],
                ]}
                weight={showSingleLine ? 3 : 1}
                min={showSingleLine ? DELAY_MINUTES_THRESHOLD_GREEN_SINGLE : DELAY_MINUTES_THRESHOLD_GREEN}
                max={showSingleLine ? DELAY_MINUTES_THRESHOLD_RED_SINGLE : DELAY_MINUTES_THRESHOLD_RED}
                palette={{
                    0.0: "green",
                    0.5: "orange",
                    1.0: "red",
                }}
            /> : <Polyline
                key={section.stationFrom.id.toString() + section.stationTo.id.toString()}
                pathOptions={{ color: 'black' }} weight={6} positions={[
                    [section.stationFrom.lat, section.stationFrom.lon],
                    [section.stationTo.lat, section.stationTo.lon],
                ]} />;
        }
        )}
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

    if (!showMap) {
        content = <TableContainer />;
    }

    const siderWidth = windowWidth > 600 ? 600 : "100%";
    return (
        <Layout>
            {contextHolder}
            <Drawer
                title=""
                placement="left"
                closable={true}
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                getContainer={false}
                width={siderWidth}
            >
                {currentStation ? <StationView station={currentStation} showSections={showSections} /> : <FilterView />}
                <Button
                    className="close-button"
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => setDrawerOpen(false)}
                />
            </Drawer >
            <FloatButton
                className="menu-button"
                style={{ visibility: showMap ? "visible" : "hidden" }}
                type="primary" onClick={() => setDrawerOpen(!drawerOpen)}
                icon={<MenuOutlined />}>
            </FloatButton>
            {showSingleLine &&
                <Button
                    className="show-all-lines"
                    style={{ visibility: showMap ? "visible" : "hidden" }}
                    onClick={() => showSections(null)}>
                    Show all Lines
                </Button>}
            {showMap && <ColorLegend isLineDelay={showSingleLine} />}
            <div className="loading-overlay" style={{ visibility: progress < 100 ? "visible" : "hidden", opacity: progress < 100 ? 1 : 0 }}>
                <Progress type="circle" percent={progress} status={progress < 100 ? "active" : (sectionLoadingState !== "idle" || stationLoadingState !== "idle") ? "exception" : "success"} />
            </div>
            <Layout>
                <Header>
                    <div className="header-content">
                        <img src="/ui/logo.png" alt="logo" className="logo" />
                        <Title level={2} className="title">{windowWidth > 600 ? "Train Delay Visualizer" : "TDV"}</Title>
                    </div>
                    <Button icon={showMap ? <AppstoreOutlined /> : <EnvironmentOutlined />} disabled={progress < 100} onClick={() => setShowMap(!showMap)} className="toggle-button">Toggle Map</Button>
                </Header>
                <Content style={{ overflow: "auto" }}>
                    {content}
                </Content>
            </Layout>
        </Layout >
    );
}

export default Map;
