import React, { useEffect, useState } from "react";
import { Divider, Typography, Row, Col, Form, DatePicker, Card, Tag, Input, AutoComplete, Skeleton, Flex, Button } from "antd";
import { SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons";
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

    const initialFromDate = dayjs(getMidnightYesterday());
    const initialToDate = dayjs(getEndOfDayYesterday());

    const [loading, setLoading] = useState<boolean>(false);
    const [fromDate, setFromDate] = useState<Dayjs>(initialFromDate);
    const [toDate, setToDate] = useState<Dayjs>(initialToDate);
    const [lineName, setLineName] = useState<string | undefined>(undefined);
    const [lineStatistics, setLineStatistics] = useState<LineStatisticDto[]>([]);
    const [filteredLines, setFilteredLines] = useState<ValueLabelDto[]>([]);
    const [isAsc, setIsAsc] = useState<boolean>(true);

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

    const changeSort = () => {
        setIsAsc(!isAsc);
        setLineStatistics(lineStatistics.reverse());
    }

    return (
        <div style={{ padding: '2rem' }}>

            <Row>
                <Col span={6} push={18}>

                </Col>

                <Col span={18} pull={6}>
                    <Title data-testid="table-container-title" level={4}>
                        Train Line Statistic
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
                                <DatePicker style={{ width: '100%' }} onChange={(date) => setFromDate(date ?? initialFromDate)} format="DD.MM.YYYY" />
                            </Form.Item>

                            <Form.Item style={{ flex: '1 1 0%', paddingLeft: '1rem' }} label="To Date" name="toDate" initialValue={toDate}>
                                <DatePicker style={{ width: '100%' }} onChange={(date) => setToDate(date ?? initialToDate)} format="DD.MM.YYYY" />
                            </Form.Item>
                        </Flex>
                    </Form>

                </Col>
            </Row>

            <Divider orientation="left" />

            <Flex justify="space-between" align="center">
                <div>
                    {lineStatistics.length > 0 ? <strong>{lineStatistics.length} results found</strong> : <strong>No results found</strong>}
                </div>
                <div>
                    <Button icon={isAsc ? <SortDescendingOutlined /> : <SortAscendingOutlined />} onClick={changeSort} shape="round" type="primary"></Button>
                </div>
            </Flex>
            {loading && <>
                {Array.from({ length: 5 }).map((_, index) =>
                    <Card className="tl-container" key={index}>
                        <Skeleton.Button active size="small" style={{ width: '40px', height: '22px' }}></Skeleton.Button><br></br>
                        <Skeleton.Button active size="small" style={{ width: '150px', height: '18px', marginTop: '10px' }}></Skeleton.Button><br></br>
                        <Skeleton.Button active size="small" style={{ width: '150px', height: '18px', marginTop: '10px' }}></Skeleton.Button>
                    </Card >
                )}
            </>}
            {lineStatistics?.map((lineStatistic) => {
                const { delayColor: arrivalDelayColor, delayMinutes: arrivalDelayMinutes, delaySeconds: arrivalDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(lineStatistic.averageArrivalDelaySeconds);
                const { delayColor: departureDelayColor, delayMinutes: departureDelayMinutes, delaySeconds: departureDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(lineStatistic.averageDepartureDelaySeconds);
                return <Card className="tl-container" key={lineStatistic.name}>
                    <div>
                        Train Line: <Tag data-testid="line-name" color="red">{lineStatistic.name}</Tag>
                    </div>
                    <p style={{ paddingTop: '5px' }}>Ø Arrival Delay: <span style={{ color: arrivalDelayColor }}>{arrivalDelayMinutes}min {arrivalDelaySeconds}s</span></p>
                    <p>Ø Departure Delay: <span style={{ color: departureDelayColor }}>{departureDelayMinutes}min {departureDelaySeconds}s</span></p>
                </Card >;
            })}

        </div>
    );
}

export default LineStatisticContainer;