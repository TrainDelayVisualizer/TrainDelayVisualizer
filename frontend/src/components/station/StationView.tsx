import React, { useEffect, useState } from "react";
import { Station } from "../../store/stationSlice"
import { Typography, DatePicker, TimePicker } from "antd";
import { serverUrl } from '../../util/request';
import dayjs from 'dayjs';
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import TrainLineViewList from "./TrainLineViewList";
import "./StationView.css";
import { getMidnightYesterday } from "../../util/date.util";

const { Title } = Typography;

type StationViewProps = {
    station: Station,
};

function StationView({ station }: StationViewProps) {
    const d = getMidnightYesterday()

    const [date, setDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<Dayjs | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Date>(d);

    useEffect(() => {
        setPage(0);
        setCount(0);
        setSelectedIdx(-1);
    }, [station.id]);
    useEffect(() => {
        const newDate = new Date();
        if (date) {
            newDate.setFullYear(date.year());
            newDate.setMonth(date.month());
            newDate.setDate(date.date());
        } else {
            newDate.setFullYear(d.getFullYear());
            newDate.setMonth(d.getMonth());
            newDate.setDate(d.getDate());
        }
        if (time) {
            newDate.setHours(time.hour());
            newDate.setMinutes(time.minute());
            newDate.setSeconds(0);
        } else {
            newDate.setHours(0);
            newDate.setMinutes(0);
            newDate.setSeconds(0);
        }

        setFilter(newDate)
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
                setResults(data.results);
            }, Math.floor(Math.random() * (10 - 3 + 1) + 3) * 100 - (new Date().getTime() - loadingFrom.getTime()));
        }).catch(error => {
            if (error.name !== 'AbortError') {
                console.error(error);
            }
        })
        return () => {
            controller.abort(); // cancel requests on page change
        }
    }, [page, station.id, filter]);

    const onDateChange: DatePickerProps['onChange'] = (date) => {
        setDate(date);
    };
    const onTimeChange: TimePickerProps['onChange'] = (time) => {
        setTime(time);
    };
    return (
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
              onSelect={(index: number) => setSelectedIdx(index)}
              setPage={(page: number) => setPage(page)} />
        </div>
    );
}
export default StationView;