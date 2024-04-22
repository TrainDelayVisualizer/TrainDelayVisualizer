import React, { useEffect, useState } from "react";
import { Station } from "../../store/stationSlice"
import { Typography, DatePicker, TimePicker, Button } from "antd";
import { FilterOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import TrainLineView from "./TrainLineView";
import { serverUrl } from '../../util/request'
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import "./StationView.css";

const { Title } = Typography;

type StationViewProps = {
    station: Station,
};

function StationView({ station }: StationViewProps) {
    const [date, setDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<Dayjs | null>(null);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [results, setResults] = useState([]);

    useEffect(() => {
        console.log("date", date?.format('DD.MM.YYYY'));
        console.log("time", time?.format('HH:mm'));
    }, [date, time]);

    console.log(results)

    const d = new Date();
    useEffect(() => {
        fetch(serverUrl() + `/stations/${station.id}/rides?date=${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate() - 1}&page=${page}`).then(res => res.json()).then(data => {
            setCount(data.count);
            setResults(data.results);
        });
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

            <TrainLineView selected={selectedIdx == 0} onSelect={() => setSelectedIdx(0)} />
            <TrainLineView selected={selectedIdx == 1} onSelect={() => setSelectedIdx(1)} />
            <div className="table-control">
                <Button type="primary" shape="circle" icon={<LeftOutlined />} size="small" disabled={page == 0} onClick={() => setPage(page - 1)} />
                <p>Showing entries {page * 20 + 1}-{(page + 1) * 20 > count ? count : (page + 1) * 20} / {count}</p>
                <Button type="primary" shape="circle" icon={<RightOutlined />} size="small" disabled={(page + 1) * 20 >= count} onClick={() => setPage(page + 1)} />
            </div>
        </div>
    );
}
export default StationView;