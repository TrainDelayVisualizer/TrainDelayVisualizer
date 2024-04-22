import React from "react";
import { Tag, Card, Flex, Steps } from "antd";
import "./TrainLineView.css";
import { StepsProps } from 'antd';
import { serverUrl } from '../../util/request'

type TLVProps = {
    selected: boolean,
    onSelect: () => void,
};

const customDot: StepsProps['progressDot'] = (dot) => (
    dot
);
const customDescription = (plannedArrival: string | null, plannedDeparture: string | null, arrivalDelay: number | null, departureDelay: number | null) => {
    let arrivalDelayColor;
    let departureDelayColor;
    if (arrivalDelay !== null) {
        arrivalDelayColor = arrivalDelay >= 6 ? "red" : arrivalDelay >= 3 ? "orange" : "green";
    }
    if (departureDelay !== null) {
        departureDelayColor = departureDelay >= 6 ? "red" : departureDelay >= 3 ? "orange" : "green";
    }

    if (!plannedArrival) {
        return (
            <div>{plannedDeparture} <span style={{ color: departureDelayColor }}>+{departureDelay}</span></div>
        )
    } else if (!plannedDeparture) {
        return (
            <div>{plannedArrival} <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span></div>
        )
    } else {
        return (
            <div>{plannedArrival} <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span> | {plannedDeparture} <span style={{ color: departureDelayColor }}>+{departureDelay}</span></div>
        )
    }
};

function TrainLineView({ selected, onSelect }: TLVProps) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date();
    toDate.setDate(toDate.getDate());
    toDate.setHours(23, 59, 59, 999);
    fetch(serverUrl() + '/sections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: fromDate,
            to: toDate,
            delaysOnly: false,
        }),
    }).then(response => response.json()).then(data => {
        console.log('Success:', data);
    });

    return <Card className="tl-container" onClick={onSelect} style={{ backgroundColor: selected ? "#f0f0f0" : "#ffffff" }}>
        <Flex justify="space-between">
            <div>
                <Tag color="cyan">S</Tag>
                <Tag color="red">S12</Tag>
            </div>
            <Tag color="blue">Schweizerische Bundesbahn SBB</Tag>
        </Flex>

        <Flex className="second-row" justify="space-between">
            <b>14.03.2024</b>
            <p>Rapperswil SG → Luzern</p>
            <p>Average Delay: 2min</p>
        </Flex>

        <Steps
            current={10}
            progressDot={customDot}
        >
            <Steps.Step title="Rapperswil SG" description={customDescription("12:03", null, 3, null)} />
            <Steps.Step title="Männedorf" description={customDescription("12:15", "12:18", 3, 6)} />
            <Steps.Step title="EGG ZH" description={customDescription("12:27", "12:35", 5, 0)} />
            <Steps.Step title="Luzern" description={customDescription("13:00", null, 4, null)} />
        </Steps>

    </Card>
}

export default TrainLineView;