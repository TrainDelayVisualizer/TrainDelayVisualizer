import React, { useEffect, useState } from "react";
import { Divider, Typography, Row, Col, Form, DatePicker, Card, Tag, Input, AutoComplete, Skeleton, Flex } from "antd";
import type { Dayjs } from "dayjs";
import { getEndOfDayYesterday, getMidnightYesterday } from "../../util/date.util";
import { serverUrl } from "../../util/request";
import dayjs from "dayjs";
import { LineStatisticDto } from "../../model/LineStatstic";
import { DelayCalculationUtils } from "../../util/delay-calculation.utils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchLines } from "../../store/lineSlice";
import { DefaultOptionType } from "antd/es/select";

const { Title } = Typography;
type ValueLabelDto = { id: string; value: string; label: string; };

function LineStatisticContainer() {

    const [loading, setLoading] = useState<boolean>(false);
    const [fromDate, setFromDate] = useState<Dayjs>(dayjs(getMidnightYesterday()));
    const [toDate, setToDate] = useState<Dayjs>(dayjs(getEndOfDayYesterday()));
    const [lineName, setLineName] = useState<string | undefined>(undefined);
    const [lineStatistics, setLineStatistics] = useState<LineStatisticDto[]>([]);
    const [filteredLines, setFilteredLines] = useState<ValueLabelDto[]>([]);

    const lines = useAppSelector((state) => state.line.all);
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchLines());
    }, []);

    useEffect(() => {
        setFilteredLines(lines.map((line) => ({ id: line, value: line, label: line })));
    }, [lines]);

    useEffect(() => {
        setLoading(true);
        setLineStatistics([]);
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

    const onLineSelect = (_: string, option: DefaultOptionType) => {
        setLineName((option as ValueLabelDto).value);
    };

    const onSearchLines = (searchText: string) => {
        setFilteredLines(lines.filter((line) => line.toLowerCase().includes(searchText.toLowerCase()))
            .map((line) => ({ id: line, value: line, label: line })));
    };

    return (
        <div style={{ padding: '2rem' }}>

            <Row>
                <Col span={6} push={18}>

                </Col>

                <Col span={18} pull={6}>
                    <Title data-testid="table-container-title" level={4}>
                        Select a Train Line
                    </Title>

                    <Form layout="vertical" style={{ maxWidth: '600px' }}>

                        <Form.Item label="Train Line" name="trainStation">
                            <div className="table-view-input">
                                <AutoComplete
                                    style={{ width: '100%' }}
                                    value={lineName}
                                    options={filteredLines}
                                    onSelect={onLineSelect}
                                    onSearch={onSearchLines}
                                    onChange={(text) => setLineName(text)}
                                    placeholder="Start typing to search...">
                                    <Input.Search />
                                </AutoComplete>
                            </div>
                        </Form.Item>
                        <Flex>
                            <Form.Item style={{ flex: '1 1 0%' }} label="From Date" name="fromDate" initialValue={fromDate}>
                                <DatePicker style={{ width: '100%' }} onChange={(date) => setFromDate(date)} format="DD.MM.YYYY" />
                            </Form.Item>

                            <Form.Item style={{ flex: '1 1 0%', paddingLeft: '1rem' }} label="To Date" name="toDate" initialValue={toDate}>
                                <DatePicker style={{ width: '100%' }} onChange={(date) => setToDate(date)} />
                            </Form.Item>
                        </Flex>
                    </Form>

                </Col>
            </Row>

            <Divider orientation="left" />

            <Row>
                <Col span={24}>
                    {lineStatistics.length > 0 ? <strong>{lineStatistics.length} results found</strong> : <strong>No results found</strong>}
                </Col>
            </Row>
            {loading && <>
                <Card className="tl-container">
                    <Skeleton.Button active size="small" style={{ width: '40px', height: '22px' }}></Skeleton.Button><br></br>
                    <Skeleton.Button active size="small" style={{ width: '150px', height: '18px', marginTop: '10px' }}></Skeleton.Button><br></br>
                    <Skeleton.Button active size="small" style={{ width: '150px', height: '18px', marginTop: '10px' }}></Skeleton.Button>
                </Card >
            </>}
            {lineStatistics?.map((lineStatistic) => {
                const { delayColor: arrivalDelayColor, delayMinutes: arrivalDelayMinutes, delaySeconds: arrivalDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(lineStatistic.averageArrivalDelaySeconds);
                const { delayColor: departureDelayColor, delayMinutes: departureDelayMinutes, delaySeconds: departureDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(lineStatistic.averageDepartureDelaySeconds);
                return <>
                    <Card className="tl-container">
                        <div>
                            <Tag data-testid="line-name" color="red">{lineStatistic.name}</Tag>
                        </div>
                        <p style={{ paddingTop: '5px' }}>Ø Arrival Delay: <span style={{ color: arrivalDelayColor }}>{arrivalDelayMinutes}min {arrivalDelaySeconds}s</span></p>
                        <p>Ø Departure Delay: <span style={{ color: departureDelayColor }}>{departureDelayMinutes}min {departureDelaySeconds}s</span></p>
                    </Card >
                </>;
            })}

        </div>
    );
}

export default LineStatisticContainer;