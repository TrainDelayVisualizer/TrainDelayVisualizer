import React, { useEffect, useState } from "react";
import { Station } from "../../store/stationSlice"
import { Typography, DatePicker, TimePicker, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";

const { Title } = Typography;

type StationViewProps = {
    station: Station;
};



function StationView({ station }: StationViewProps) {
    const [date, setDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<Dayjs | null>(null);

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
            <Title level={4}><i>Train lines passing</i></Title>
            <Title level={2}>{station?.description}</Title>
            Date:
            <DatePicker onChange={onDateChange} />
            Departure Time From:
            <TimePicker onChange={onTimeChange} />
            <Button type="primary" icon={<FilterOutlined />}>Filter</Button>
        </div>
    );
}
export default StationView;