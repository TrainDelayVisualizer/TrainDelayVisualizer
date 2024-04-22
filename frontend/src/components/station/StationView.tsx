import React, { useEffect, useState } from "react";
import { Station } from "../../store/stationSlice"
import { Typography, DatePicker, TimePicker, Button } from "antd";
import { FilterOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import TrainLineView, { LoadingComponent } from "./TrainLineView";
import { serverUrl } from '../../util/request';
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
    const [date, setDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<Dayjs | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("date", date?.format('DD.MM.YYYY'));
        console.log("time", time?.format('HH:mm'));
    }, [date, time]);

    const d = new Date();
    useEffect(() => {
        setLoading(true);
        const loadingFrom = new Date();
        const controller = new AbortController();
        const signal = controller.signal;
        fetch(serverUrl() + `/stations/${station.id}/rides?date=${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate() - 1}&page=${page}`, { signal }).then(res => res.json()).then(data => {
            setTimeout(() => {
                setLoading(false);
                setCount(data.count);
                setResults(data.results);
            }, Math.floor(Math.random() * (10 - 3 + 1) + 3) * 100 - (new Date().getTime() - loadingFrom.getTime()));
        }).catch(error => {
            if (error.name === 'AbortError') {
                //ignore
            } else {
                // TODO:
            }
        })
        return () => {
            controller.abort();
        }
    }, [page]);

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
                <DatePicker onChange={onDateChange} />
                Departure Time From:
                <TimePicker onChange={onTimeChange} />
                <Button type="primary" icon={<FilterOutlined />}>Filter</Button>
            </div>
            <div className="table-control">
                <Button type="primary" shape="circle" icon={<LeftOutlined />} size="small" disabled={page == 0} onClick={() => setPage(page - 1)} />
                <p>Showing entries {page * 20 + 1}-{(page + 1) * 20 > count ? count : (page + 1) * 20} / {count}</p>
                <Button type="primary" shape="circle" icon={<RightOutlined />} size="small" disabled={(page + 1) * 20 >= count} onClick={() => setPage(page + 1)} />
            </div>

            {loading ? <div>{[...Array(20)].map((_, i) => <LoadingComponent key={i} />)}</div> :
                <div>
                    {
                        results.map((ride: TrainRide, i: number) => <TrainLineView key={i} selected={selectedIdx == i} name={ride.name} lineName={ride.lineName} sections={ride.sections} onSelect={() => setSelectedIdx(i)} />)
                    }
                </div>
            }
        </div>
    );
}
export default StationView;