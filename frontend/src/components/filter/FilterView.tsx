import React, { useEffect, useState } from "react";
import type { Dayjs } from "dayjs";
import { DatePicker, TimePicker, Select, Divider, Button } from "antd";
import dayjs from 'dayjs';
import type { DatePickerProps, TimePickerProps } from 'antd';
import "./FilterView.css";
import { getMidnightYesterday } from "../../util/date.util";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchLines } from "../../store/lineSlice";
import { fetchSections } from "../../store/sectionSlice";

const Option = Select.Option;

function FilterView({ closeDrawer }: { closeDrawer: () => void; }) {
    const d = getMidnightYesterday();
    const [date, setDate] = useState<Dayjs>(dayjs(d));
    const [fromTime, setFromTime] = useState<Dayjs | null>(null);
    const [toTime, setToTime] = useState<Dayjs | null>(null);
    const [selectedLine, setSelectedLine] = useState<string | null>(null);
    const [selectedTrainType, setSelectedTrainType] = useState<string | null>(null);
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

    const lines = useAppSelector((state) => state.line.all);
    const trainTypes = useAppSelector((state) => state.line.types);
    const operators = useAppSelector((state) => state.line.operators);
    const dispatch = useAppDispatch();

    const onDateChange: DatePickerProps['onChange'] = (date) => {
        setDate(date);
    };
    const onFromTimeChange: TimePickerProps['onChange'] = (time) => {
        setFromTime(time);
    };
    const onToTimeChange: TimePickerProps['onChange'] = (time) => {
        setToTime(time);
    };
    useEffect(() => {
        dispatch(fetchLines());
    }, []);

    function onClick() {
        dispatch(fetchSections({ 
            fromDate: date.toDate(), 
            fromTime: fromTime?.toDate(), 
            toTime: toTime?.toDate(), 
            line: selectedLine || undefined, 
            trainType: selectedTrainType || undefined,
            operator: selectedOperator || undefined,
        }));
        closeDrawer();
    }

    return (
        <div className="filter-view">
            <p>Date:</p>
            <DatePicker defaultValue={dayjs(d)} allowClear={false} onChange={onDateChange} format="DD.MM.YYYY" data-testid="date-picker"  />
            <div className="filter-view-block">
                <p>Departure Time From:</p>
                <TimePicker onChange={onFromTimeChange} data-testid="from-time" />
                <p>Departure Time To:</p>
                <TimePicker onChange={onToTimeChange} data-testid="to-time" />
            </div>
            <Divider />
            <div className="filter-view-block">
                <p>Line:</p>
                <Select
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    className="filter-view-select"
                    onChange={(value: string) => setSelectedLine(value)}
                    data-testid="line-select"
                >
                    {lines.map((line) => (<Option key={line}>{line}</Option>))}
                </Select>
            </div>
            <div className="filter-view-block">
                <p>Train type:</p>
                <Select
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    className="filter-view-select"
                    onChange={(value: string) => setSelectedTrainType(value)}
                    data-testid="train-type-select"
                >
                    {trainTypes.map((trainType) => (<Option key={trainType}>{trainType}</Option>))}
                </Select>
            </div>
            <div className="filter-view-block">
                <p>Train operator:</p>
                <Select 
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    className="filter-view-select-long"
                    onChange={(value: string) => setSelectedOperator(value)}
                    data-testid="operator-select"
                    >
                        {operators.map((operator) => (<Option key={operator}>{operator}</Option>))}
                    </Select>
            </div>
            <Divider />
            <Button type="primary" onClick={onClick} data-testid="filter-btn">Filter</Button>
        </div>
    );
}

export default FilterView;