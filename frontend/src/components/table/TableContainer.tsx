import React, { useEffect, useState } from "react";
import { Divider, Typography, Row, Col, Form, DatePicker, TimePicker, AutoComplete } from "antd";
import type { DatePickerProps, TimePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import TrainLineView from "../station/TrainLineView";
import "./TableContainer.css";

const { Title } = Typography;

function TableContainer() {
  const [selectedTrainStation, setSelectedTrainStation] = useState('');
  const [trainStationOptions, setTrainStationOptions] = useState<{ value: string }[]>([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<Dayjs | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  useEffect(() => {
    console.log("date", date?.format('DD.MM.YYYY'));
    console.log("time", time?.format('HH:mm'));
  }, [date, time]);

  const onDateChange: DatePickerProps['onChange'] = (date) => {
    setDate(date);
  }

  const onTimeChange: TimePickerProps['onChange'] = (time) => {
    setTime(time);
  }

  const onSearchTrainStations = (searchText: string) => {
    setTrainStationOptions([
      { value: "Rapperswil SG" },
      { value: "Zürich HB" },
      { value: "Zürich Oerlikon" },
      { value: "Zürich Flughafen" },
      { value: "Jona SG" },
    ].filter((option) => option.value.toLowerCase().includes(searchText.toLowerCase())));
    console.log(searchText);
  }

  const onTrainStationSelect = (value: string) => {
    console.log(value);
  }

  return (
    <div className="table-container" style={{ overflowY: "scroll" }}>

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
          <Title level={4}><i>Train lines passing</i></Title>

          <Form layout="vertical">
            <Form.Item label="Train Station" name="trainStation">
              <div className="table-view-input">
                <AutoComplete 
                  value={selectedTrainStation}
                  options={trainStationOptions}
                  onSelect={onTrainStationSelect}
                  onSearch={onSearchTrainStations}
                  onChange={(text) => setSelectedTrainStation(text)}
                  placeholder="Start typing to search train stations..." />
                </div>
            </Form.Item> 

            <Form.Item label="Date" name="date">
              <DatePicker className="table-view-input" onChange={onDateChange} />
            </Form.Item>

            <Form.Item label="Departure Time From" name="time">
              <TimePicker className="table-view-input" onChange={onTimeChange} />
            </Form.Item>
          </Form>

        </Col>
      </Row>

      <Divider orientation="left" />

      <Row>
        <Col span={24}>
          24 entries
        </Col>
      </Row>

      <TrainLineView selected={selectedIdx == 0} onSelect={() => setSelectedIdx(0)} />
      <TrainLineView selected={selectedIdx == 1} onSelect={() => setSelectedIdx(1)} />
    </div>
  );
}

export default TableContainer;