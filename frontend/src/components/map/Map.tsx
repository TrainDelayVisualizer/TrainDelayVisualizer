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
import { MenuOutlined, EnvironmentOutlined, AppstoreOutlined, CloseOutlined, LineChartOutlined } from "@ant-design/icons";

import StationView from "../station/StationView";
import FilterView from "../filter/FilterView";
import type { Station } from "../../model/Station";
import type { Section } from "../../model/Section";
import ColorLegend from "../colorLegend/ColorLegend";
import LineStatisticContainer from "../statistics/LineStatisticContainer";
import TableContainer from "../table/TableContainer";

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

const PROGRESS_UPDATE_MIN = 4;
const PROGRESS_UPDATE_RANGE = 16;
const PROGRESS_WAIT_MIN = 500;
const PROGRESS_WAIT_RANGE = 500;

function Map() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef: RefObject<any> = useRef();
    const [progress, setProgress] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewStatus, setViewStatus] = useState<'Map' | 'LineStatistic' | 'Table'>('Map');
    const [windowWidth, setWidth] = useState(window.innerWidth);
    const [currentStation, setCurrentStation] = useState<Station | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [showSingleLine, setShowSingleLine] = useState(false);
    const [currTimeout, setCurrTimeout] = useState<NodeJS.Timeout | undefined>();

    const stations = useAppSelector((state) => state.station.all);
    const loadedSections = useAppSelector((state) => state.section.filtered);
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

    function updateProgress(curr: number = 0) {
        const newProgress = curr < 92 ? curr + PROGRESS_UPDATE_MIN + Math.floor(Math.random() * PROGRESS_UPDATE_RANGE) : 100;
        if (newProgress < 100) {
            setProgress(newProgress);
            setCurrTimeout(
                setTimeout(() => {
                    updateProgress(newProgress);
                }, PROGRESS_WAIT_MIN + Math.floor(Math.random() * PROGRESS_WAIT_RANGE))
            );
        }
    }
    useEffect(() => {
        updateProgress();
        return () => clearTimeout(currTimeout);
    }, []);

    useEffect(() => {
        if (sectionLoadingState === "loading" && progress === 100) {
            updateProgress(0);
        }
        if (sectionLoadingState === "idle" && stationLoadingState === "idle" && progress > 0) {
            clearTimeout(currTimeout);
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
    }, [sectionLoadingState, stationLoadingState, currTimeout]);

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
            // delays are in seconds - convert to minutes
            const sectionsCopy = JSON.parse(JSON.stringify(sections));
            sectionsCopy.forEach((section: Section) => {
                // convert to minutes
                section.averageDepartureDelay /= 60;
                section.averageArrivalDelay /= 60;
            });
            setShowSingleLine(true);
            setSections(sectionsCopy);
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
                key={section.stationFrom.id.toString() + section.stationTo.id.toString() + section.averageDepartureDelay.toString() + section.averageArrivalDelay.toString()}
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

    if (viewStatus === 'LineStatistic') {
        content = <LineStatisticContainer />;
    }

    if (viewStatus === 'Table') {
        content = <TableContainer />;
    }

    function onCloseDrawer() {
        setDrawerOpen(false);
        if (!showSingleLine) {
            setCurrentStation(null);
        }
    }

    const siderWidth = windowWidth > 600 ? 600 : "100%";
    return (
        <Layout>
            {contextHolder}
            <Drawer
                title=""
                placement="left"
                closable={true}
                onClose={onCloseDrawer}
                open={drawerOpen}
                getContainer={false}
                width={siderWidth}
            >
                {currentStation ? <StationView station={currentStation} showSections={showSections} /> : <FilterView closeDrawer={() => setDrawerOpen(false)} />}
                <Button
                    className="close-button"
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => setDrawerOpen(false)}
                />
            </Drawer >
            <FloatButton
                className="menu-button"
                style={{ visibility: viewStatus === 'Map' ? "visible" : "hidden" }}
                type="primary" onClick={() => setDrawerOpen(!drawerOpen)}
                icon={<MenuOutlined />}>
            </FloatButton>
            {showSingleLine &&
                <Button
                    className="show-all-lines"
                    style={{ visibility: viewStatus === 'Map' ? "visible" : "hidden" }}
                    onClick={() => { showSections(null); setCurrentStation(null); }}>
                    Show all Lines
                </Button>}
            {viewStatus === 'Map' && <ColorLegend isLineDelay={showSingleLine} />}
            <div className="loading-overlay" style={{ visibility: progress < 100 ? "visible" : "hidden", opacity: progress < 100 ? 1 : 0 }}>
                <Progress type="circle" percent={progress} status={progress < 100 ? "active" : (sectionLoadingState === "failure" || stationLoadingState === "failure") ? "exception" : "success"} />
            </div>
            <Layout>
                <Header>
                    <div className="header-content">
                        <img src="/ui/logo.png" alt="logo" className="logo" />
                        <Title level={2} className="title">{windowWidth > 600 ? "Train Delay Visualizer" : "TDV"}</Title>
                    </div>
                    <div className="toggle-button">
                        {viewStatus !== 'Map' && <Button icon={<EnvironmentOutlined />}
                            disabled={progress < 100} onClick={() => { setViewStatus('Map'); setDrawerOpen(false); }}
                        >Show Map</Button>}
                        {viewStatus !== 'LineStatistic' && <Button icon={<LineChartOutlined />}
                            disabled={progress < 100} onClick={() => { setViewStatus('LineStatistic'); setDrawerOpen(false); }}
                            style={{ marginLeft: '1rem' }} >Show Statistic</Button>}
                        {viewStatus !== 'Table' && <Button icon={<AppstoreOutlined />}
                            disabled={progress < 100} onClick={() => { setViewStatus('Table'); setDrawerOpen(false); }}
                            style={{ marginLeft: '1rem' }}>Show Table</Button>}
                    </div>
                </Header>
                <Content style={{ overflow: "auto" }}>
                    {content}
                </Content>
            </Layout>
        </Layout >
    );
}

export default Map;
