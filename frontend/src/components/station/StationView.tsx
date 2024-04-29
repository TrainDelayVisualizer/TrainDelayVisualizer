import React, { useEffect, useState } from "react";
import { Typography, DatePicker, TimePicker } from "antd";
import { serverUrl } from '../../util/request';
import dayjs from 'dayjs';
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import "./StationView.css";
import { getMidnightYesterday } from "../../util/date.util";
import TrainLineViewList from "./TrainLineViewList";
import { StationViewProps } from "../../model/props/StationViewProps";
import { TrainRide, TrainRideDTO } from "../../model/TrainRide";
import { Section, SectionDTO } from "../../model/Section";
import store from "../../store/store";

const { Title } = Typography;

function StationView({ station, showSections }: StationViewProps) {
    const d = getMidnightYesterday();
    const [date, setDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<Dayjs | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [results, setResults] = useState<TrainRide[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Date>(d);

    useEffect(() => {
        setPage(0);
        setCount(0);
        setSelectedIdx(-1);
    }, [station.id]);

    useEffect(() => {
        let newDate = new Date();
        if (date) {
            newDate = new Date(date.year(), date.month(), date.date());
        } else {
            newDate = new Date(d);
        }
        if (time) {
            newDate.setHours(time.hour(), time.minute(), 0, 0);
        } else {
            newDate.setHours(0, 0, 0, 0);
        }
        setPage(0);
        setFilter(newDate);
    }, [date, time]);

    useEffect(() => {
        setLoading(true);
        const loadingFrom = new Date();
        const controller = new AbortController();
        const signal = controller.signal;
        fetch(serverUrl() + `/stations/${station.id}/rides?date=${filter.toISOString()}&page=${page}`, { signal }).then(res => res.json()).then(data => {
            setTimeout(() => {
                setLoading(false);
                setCount(data.count);
                const trainRides: TrainRide[] = data.results.map((ride: TrainRideDTO): TrainRide => {
                    const sections: Section[] = ride.sections.map((section: SectionDTO): Section => {
                        let averageDepartureDelay = 0;
                        let averageArrivalDelay = 0;
                        if (section.actualDeparture && section.plannedDeparture) {
                            averageDepartureDelay = (new Date(section.actualDeparture).getTime() - new Date(section.plannedDeparture).getTime()) / 60000;
                            averageDepartureDelay = Math.max(0, averageDepartureDelay);
                        }
                        if (section.actualArrival && section.plannedArrival) {
                            averageArrivalDelay = (new Date(section.actualArrival).getTime() - new Date(section.plannedArrival).getTime()) / 60000;
                            averageArrivalDelay = Math.max(0, averageArrivalDelay);
                        }
                        return {
                            plannedArrival: section.plannedArrival,
                            plannedDeparture: section.plannedDeparture,
                            actualArrival: section.actualArrival,
                            actualDeparture: section.actualDeparture,
                            stationFrom: store.getState().station.allById[section.stationFromId],
                            stationTo: store.getState().station.allById[section.stationToId],
                            averageDepartureDelay,
                            averageArrivalDelay,
                        };
                    });
                    return {
                        name: ride.name,
                        lineName: ride.lineName,
                        sections,
                    };
                });
                setResults(trainRides);
            }, Math.floor(Math.random() * (10 - 3 + 1) + 3) * 100 - (new Date().getTime() - loadingFrom.getTime()));
        }).catch(error => {
            if (error.name !== 'AbortError') {
                console.error(error);
            }
        });
        return () => {
            controller.abort(); // cancel requests on page change
        };
    }, [page, station.id, filter]);

    function onSelect(i: number) {
        if (selectedIdx === i) {
            setSelectedIdx(-1);
            showSections(null);
        } else {
            setSelectedIdx(i);
            showSections(results[i].sections);
        }
    }

    const onDateChange: DatePickerProps['onChange'] = (date) => {
        setDate(date);
    };
    const onTimeChange: TimePickerProps['onChange'] = (time) => {
        setTime(time);
    };
    return (
        <div>
            <div>
                <Title level={4}><i>Train lines passing</i></Title>
                <Title level={2}>{station?.description}</Title>
                <div className="station-filter">
                    Date:
                    <DatePicker defaultValue={dayjs(d)} onChange={onDateChange} />
                    Departure Time From:
                    <TimePicker defaultValue={dayjs(d)} onChange={onTimeChange} />
                </div>

                <TrainLineViewList
                    loading={loading}
                    trainLines={results}
                    count={count}
                    page={page}
                    selectedIndex={selectedIdx}
                    onSelect={(index: number) => onSelect(index)}
                    setPage={(page: number) => setPage(page)} />
            </div>
        </div>
    );
}
export default StationView;