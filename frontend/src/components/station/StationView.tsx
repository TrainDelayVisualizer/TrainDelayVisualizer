import React, { useEffect, useState } from "react";
import { Station } from "../../store/stationSlice"
import { Typography, DatePicker, TimePicker, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import TrainLineView from "./TrainLineView";
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

    useEffect(() => {
        console.log(date?.format('DD.MM.YYYY'));
        console.log(time?.format('HH:mm'));
    });

    const onDateChange: DatePickerProps['onChange'] = (date) => {
        setDate(date);
    };
    const onTimeChange: TimePickerProps['onChange'] = (time) => {
        setTime(time);
    };

    return (
        <div>
            <div className="station-filter">
            <Title level={4}><i>Train lines passing</i></Title>
            <Title level={2}>{station?.description}</Title>
            Date:
            <DatePicker onChange={onDateChange} />
            Departure Time From:
            <TimePicker onChange={onTimeChange} />
            <Button type="primary" icon={<FilterOutlined />}>Filter</Button>
            </div>

            <TrainLineView selected={selectedIdx == 0} onSelect={() => setSelectedIdx(0)} />
            <TrainLineView selected={selectedIdx == 1} onSelect={() => setSelectedIdx(1)} />
        </div>
    );
}
export default StationView;