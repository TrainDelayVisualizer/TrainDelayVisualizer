import React, { useEffect, useState } from "react";
import { Typography, DatePicker, TimePicker } from "antd";
import dayjs from 'dayjs';
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import "./StationView.css";
import { getMidnightYesterday } from "../../util/date.util";
import TrainLineViewList from "./TrainLineViewList";
import { StationViewProps } from "../../model/props/StationViewProps";
import { TrainRide } from "../../model/TrainRide";
import { loadSectionData } from "../../util/loadSectionData.util";

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
        const controller = new AbortController();
        loadSectionData(controller.signal, filter, station.id, page).then((res: { trainRides: TrainRide[], count: number; }) => {
            setLoading(false);
            setCount(res.count);
            setResults(res.trainRides);
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
                    <DatePicker data-testid="date-picker" defaultValue={dayjs(d)} onChange={onDateChange} format="DD.MM.YYYY" />
                    Departure Time From:
                    <TimePicker data-testid="time-picker" defaultValue={dayjs(d)} onChange={onTimeChange} />
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