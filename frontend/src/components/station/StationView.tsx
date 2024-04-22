import React, { useEffect, useState } from "react";
import { Station } from "../../store/stationSlice"
import { Typography, DatePicker, TimePicker, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import TrainLineView, { LoadingComponent } from "./TrainLineView";
import { serverUrl } from '../../util/request';
import dayjs from 'dayjs';
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import "./StationView.css";

const { Title } = Typography;

type StationViewProps = {
    station: Station,
};

export type Section = {
    stationFromId: number,
    stationToId: number,
    plannedArrival: string | null,
    plannedDeparture: string | null,
    actualDeparture: string | null,
    actualArrival: string | null,
};

type TrainRide = {
    name: string,
    lineName: string,
    sections: Array<Section>,
};

function StationView({ station }: StationViewProps) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
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
            if (error.name === 'AbortError') {
                //ignore
            } else {
                console.error(error);
                // TODO:
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
            <div className="table-control">
                <Button type="primary" shape="circle" icon={<LeftOutlined />} size="small" disabled={page == 0} onClick={() => setPage(page - 1)} />
                <p>Showing entries {page * 20 + 1}-{(page + 1) * 20 > count ? count : (page + 1) * 20} / {count}</p>
                <Button type="primary" shape="circle" icon={<RightOutlined />} size="small" disabled={(page + 1) * 20 >= count} onClick={() => setPage(page + 1)} />
            </div>

            {loading ? <div>{[...Array(20)].map((_, i) => <LoadingComponent key={i} />)}</div> : count > 0 ?
                <div>
                    {
                        results.map((ride: TrainRide, i: number) => <TrainLineView key={i} selected={selectedIdx == i} name={ride.name} lineName={ride.lineName} sections={ride.sections} onSelect={() => setSelectedIdx(i)} />)
                    }
                </div> : <div>No rides found for filter</div>
            }
        </div>
    );
}
export default StationView;