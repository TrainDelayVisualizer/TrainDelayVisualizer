import React, { useEffect, useState } from "react";
import { Divider, Typography, Row, Col, Form, DatePicker, Card, Tag, Input } from "antd";
import type { DatePickerProps } from 'antd';
import type { Dayjs } from "dayjs";
import { getEndOfDayYesterday, getMidnightYesterday } from "../../util/date.util";
import { serverUrl } from "../../util/request";
import dayjs from "dayjs";
import { LineStatisticDto } from "../../model/LineStatstic";
import { LoadingComponent } from "../station/TrainLineView";
import { DelayCalculationUtils } from "../../util/delay-calculation.utils";

const { Title } = Typography;

function LineStatisticContainer() {

    const [loading, setLoading] = useState<boolean>(false);
    const [fromDate, setFromDate] = useState<Dayjs>(dayjs(getMidnightYesterday()));
    const [toDate, setToDate] = useState<Dayjs>(dayjs(getEndOfDayYesterday()));
    const [lineName, setLineName] = useState<string | undefined>(undefined);
    const [lineStatistics, setLineStatistics] = useState<LineStatisticDto[]>([]);


    useEffect(() => {
        setLoading(true);
        fetch(`${serverUrl()}/statistic/line?from=${fromDate.startOf('day').toISOString()}&to=${toDate.endOf('day').toISOString()}&lineName=${lineName ?? ''}`)
            .then(res => res.json())
            .then((data: LineStatisticDto[]) => {
                setLoading(false);
                setLineStatistics(data);
            })
            .catch(err => {
                setLoading(false);
                console.error(err);
            });
    }, [fromDate, toDate, lineName]);

    const onDateChange: DatePickerProps['onChange'] = (date) => {
        setFromDate(date);
    };

    const onTimeChange: DatePickerProps['onChange'] = (date) => {
        setToDate(date);
    };



    return (
        <div style={{ padding: '2rem' }}>

            <Row>
                <Col span={6} push={18}>

                </Col>

                <Col span={18} pull={6}>
                    <Title data-testid="table-container-title" level={4}>
                        Select a Train Station
                    </Title>

                    <Form layout="vertical">

                        <Form.Item label="Line Name" name="lineName" initialValue={lineName}>
                            <Input className="table-view-input" onChange={(e) => setLineName(e.target.value)}></Input>
                        </Form.Item>
                        <Form.Item label="From Date" name="fromDate" initialValue={fromDate}>
                            <DatePicker className="table-view-input" onChange={onDateChange} format="DD.MM.YYYY" />
                        </Form.Item>

                        <Form.Item label="To Date" name="toDate" initialValue={toDate}>
                            <DatePicker className="table-view-input" onChange={onTimeChange} />
                        </Form.Item>
                    </Form>

                </Col>
            </Row>

            <Divider orientation="left" />

            <Row>
                <Col span={24}>
                    {lineStatistics.length > 0 ? <strong>{lineStatistics.length} results found</strong> : <strong>No results found</strong>}
                </Col>
            </Row>
            {loading && <LoadingComponent />}
            {lineStatistics?.map((lineStatistic) => {
                const { delayColor: arrivalDelayColor, delayMinutes: arrivalDelayMinutes, delaySeconds: arrivalDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(lineStatistic.averageArrivalDelaySeconds);
                const { delayColor: departureDelayColor, delayMinutes: departureDelayMinutes, delaySeconds: departureDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(lineStatistic.averageDepartureDelaySeconds);
                return <>
                    <Card className="tl-container">
                        <div>
                            <Tag data-testid="line-name" color="red">{lineStatistic.name}</Tag>
                        </div>
                        <p style={{ paddingTop: '5px' }}>Average Arrival Delay: <span style={{ color: arrivalDelayColor }}>{arrivalDelayMinutes}min {arrivalDelaySeconds}s</span></p>
                        <p>Average Departure Delay: <span style={{ color: departureDelayColor }}>{departureDelayMinutes}min {departureDelaySeconds}s</span></p>
                    </Card >
                </>;
            })}

        </div>
    );
}

export default LineStatisticContainer;