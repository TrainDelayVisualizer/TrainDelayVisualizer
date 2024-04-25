import React, { useEffect, useState } from "react";
import { Divider, Typography, Row, Col, Form, DatePicker, TimePicker, AutoComplete, Input } from "antd";
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import { getMidnightYesterday } from "../../util/date.util";
import { serverUrl } from "../../util/request";
import "./TableContainer.css";
import dayjs from "dayjs";
import TrainLineViewList from "../station/TrainLineViewList";
import { DefaultOptionType } from "antd/es/select";

const { Title } = Typography;

type ValueLabelDto = {
  id: number;
  value: string;
  label: string;
};

function TableContainer() {
  const d = getMidnightYesterday();

  const [selectedTrainStation, setSelectedTrainStation] = useState('');
  const [trainStationOptions, setTrainStationOptions] = useState<ValueLabelDto[]>([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [results, setResults] = useState([]);
  const [dateFilter, setDateFilter] = useState<Date>(d);
  const [station, setStation] = useState<ValueLabelDto | null>(null);
 
  useEffect(() => {
    setPage(0);
    setCount(0);
  }, [station?.id]);

  useEffect(() => {
    let newDate = new Date();
    if (date) {
      newDate = new Date(date.date());
    } else {
      newDate = new Date(d);
    }
    if (time) {
      newDate.setHours(time.hour(), time.minute(), 0, 0);
    } else {
      newDate.setHours(0, 0, 0, 0);
    }

    setDateFilter(newDate)
  }, [date, time]);

  const onDateChange: DatePickerProps['onChange'] = (date) => {
    setDate(date);
  }

  const onTimeChange: TimePickerProps['onChange'] = (time) => {
    setTime(time);
  }

  const onSearchTrainStations = (searchText: string) => {
    fetch(`${serverUrl()}/stations/query?s=${searchText}`)
      .then(res => res.json())
      .then(data => {
        setTrainStationOptions(data);
      })
      .catch(err => {
        console.error(err);
      });
  }

  const onTrainStationSelect = (_: string, option: DefaultOptionType) => {
    setStation(option as ValueLabelDto);
  }

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;

    if (!station) {
      setLoading(false);
      return;
    }

    fetch(`${serverUrl()}/stations/${station?.id}/rides?date=${dateFilter.toISOString()}&page=${page}`, { signal })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setCount(data.count);
        setResults(data.results);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    return () => {
      controller.abort();
    }
  }, [page, station?.id, dateFilter]);

  return (
    <div className="table-container">

      <Row>
        <Col span={6} push={18}>
          <Row>
            <Col span={24}>
              <strong>Average Delay on 14.03.2024</strong>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              Arrival
            </Col>
            <Col span={12}>
              12 min
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              Departure
            </Col>
            <Col span={12}>
              20 min
            </Col>
          </Row>
        </Col>

        <Col span={18} pull={6}>
          <Title data-testid="table-container-title" level={4}>
            <i>{station?.label ? `Train lines passing ${station.label}` : 'Select a Train Station'}</i>
          </Title>

          <Form layout="vertical">
            <Form.Item label="Train Station" name="trainStation">
              <div className="table-view-input">
                <AutoComplete
                  value={selectedTrainStation}
                  options={trainStationOptions}
                  onSelect={onTrainStationSelect}
                  onSearch={onSearchTrainStations}
                  onChange={(text) => setSelectedTrainStation(text)}
                  placeholder="Start typing to search train stations...">
                    <Input.Search />
                </AutoComplete>
              </div>
            </Form.Item>

            <Form.Item label="Date" name="date" initialValue={dayjs(d)}>
              <DatePicker className="table-view-input" onChange={onDateChange} />
            </Form.Item>

            <Form.Item label="Departure Time From" name="time" initialValue={dayjs(d)}>
              <TimePicker className="table-view-input" onChange={onTimeChange} />
            </Form.Item>
          </Form>

        </Col>
      </Row>

      <Divider orientation="left" />

      <Row>
        <Col span={24}>
          {count > 0 ? <strong>{count} results found</strong> : <strong>No results found</strong>}
        </Col>
      </Row>

      <TrainLineViewList
        loading={loading}
        trainLines={results}
        count={count}
        page={page}
        selectedIndex={0}
        setPage={(page: number) => setPage(page)}
        showNoDataMessage={false} />
    </div>
  );
}

export default TableContainer;