import React, { useState } from "react";
import type { Dayjs } from "dayjs";
import { DatePicker, TimePicker } from "antd";
import dayjs from 'dayjs';
import type { DatePickerProps, TimePickerProps } from 'antd';
import "./FilterView.css";
import { getMidnightYesterday } from "../../util/date.util";

function FilterView() {
    const d = getMidnightYesterday();
    const [date, setDate] = useState<Dayjs | null>(null);
    const [fromTime, setFromTime] = useState<Dayjs | null>(null);
    const [toTime, setToTime] = useState<Dayjs | null>(null);

    const onDateChange: DatePickerProps['onChange'] = (date) => {
        setDate(date);
    };
    const onFromTimeChange: TimePickerProps['onChange'] = (time) => {
        setFromTime(time);
    };
    const onToTimeChange: TimePickerProps['onChange'] = (time) => {
        setToTime(time);
    };
    console.log(date, fromTime, toTime);

    return (
        <div>
            Date:
            <DatePicker defaultValue={dayjs(d)} onChange={onDateChange} format="DD.MM.YYYY" />
            <div className="filter-view-block">
                Departure Time From:
                <TimePicker onChange={onFromTimeChange} />
                Departure Time To:
                <TimePicker onChange={onToTimeChange} />
            </div>
        </div>
    );
}

export default FilterView;