import React from "react";
import { Tag, Card, Flex, Steps } from "antd";
import "./TrainLineView.css";
import { StepsProps, Skeleton, StepProps } from 'antd';
import { TrainLineViewProps } from "../../model/props/TrainLineViewProps";

const customDot: StepsProps['progressDot'] = (dot) => (
    dot
);

const LONG_DELAY = 6;
const MEDIUM_DELAY = 3;

const customDescription = (plannedArrival: string | null, actualArrival: string | null, plannedDeparture: string | null, actualDeparture: string | null) => {
    let arrivalDelay, departureDelay, arrivalDelayColor, departureDelayColor;
    if (plannedArrival !== null && actualArrival !== null) {
        arrivalDelay = Math.round((new Date(actualArrival).getTime() - new Date(plannedArrival).getTime()) / 60000);
        arrivalDelay = arrivalDelay < 0 ? 0 : arrivalDelay;
        arrivalDelayColor = arrivalDelay >= LONG_DELAY ? "red" : arrivalDelay >= MEDIUM_DELAY ? "orange" : "green";
    }
    if (plannedDeparture !== null && actualDeparture !== null) {
        departureDelay = Math.round((new Date(actualDeparture).getTime() - new Date(plannedDeparture).getTime()) / 60000);
        departureDelay = departureDelay < 0 ? 0 : departureDelay;
        departureDelayColor = departureDelay >= LONG_DELAY ? "red" : departureDelay >= MEDIUM_DELAY ? "orange" : "green";
    }

    if (!plannedArrival && plannedDeparture) {
        return (
            <div>{new Date(plannedDeparture).toLocaleTimeString().slice(0, 5)} {departureDelay ? <span style={{ color: departureDelayColor }}>+{departureDelay}</span> : null}</div>
        );
    } else if (!plannedDeparture && plannedArrival) {
        return (
            <div>{new Date(plannedArrival).toLocaleTimeString().slice(0, 5)} {arrivalDelay ? <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span> : null}</div>
        );
    } else if (plannedArrival && plannedDeparture) {
        return (
            <div>{new Date(plannedArrival).toLocaleTimeString().slice(0, 5)} {arrivalDelay ? <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span> : null} | {new Date(plannedDeparture).toLocaleTimeString().slice(0, 5)} {departureDelay ? <span style={{ color: departureDelayColor }}>+{departureDelay}</span> : null}</div>
        );
    } else {
        return <div>??</div>;
    }
};

export function LoadingComponent() {
    return <Card>
        <Flex justify="space-between">
            <Skeleton.Button active size="small" />
            <Skeleton.Button active size="small" style={{ width: '80px' }} />
        </Flex>

        <Flex className="second-row" justify="space-between">
            <Skeleton.Button active size="small" style={{ width: '150px' }} />
            <Skeleton.Button active size="small" style={{ width: '100px' }} />
        </Flex>

        <Steps
            direction="horizontal"
            responsive={false}
            current={10}
            progressDot={customDot}
            items={[
                { title: <Skeleton.Button active style={{ width: '80px' }} size="small" />, description: <Skeleton.Button className="sk-btn" active style={{ width: "50px" }} size="small" /> },
                { title: <Skeleton.Button active style={{ width: '60px' }} size="small" />, description: <Skeleton.Button className="sk-btn" active style={{ width: "100px" }} size="small" /> },
                { title: <Skeleton.Button active style={{ width: '50px' }} size="small" />, description: <Skeleton.Button className="sk-btn" active style={{ width: "100px" }} size="small" /> },
            ]}
        />

    </Card>;
}

function TrainLineView({ selected, onSelect, name, lineName, sections, filterDate }: TrainLineViewProps) {
    if (!sections) {
        return null;
    }

    const currentDateString = `${("0" + filterDate.getDate()).slice(-2)}.${("0" + (filterDate.getMonth() + 1)).slice(-2)}.${filterDate.getFullYear()}`;

    const sectionsAsSteps: Array<StepProps> = [];
    for (let i = 0; i < sections.length; i++) {
        const prevSection = sections[i - 1];
        const section = sections[i];
        sectionsAsSteps.push({
            title: section.stationFrom.description,
            description: customDescription(prevSection?.plannedArrival, prevSection?.actualArrival, section.plannedDeparture, section.actualDeparture),
            status: section.isCancelled ? "error" : undefined
        });
    }
    const lastSection = sections[sections.length - 1];
    sectionsAsSteps.push({
        title: lastSection.stationTo.description,
        description: customDescription(lastSection.plannedArrival, lastSection.actualArrival, null, null),
        status: lastSection.isCancelled ? "error" : undefined
    });

    const res = sections.reduce((acc: { sum: number, n: number }, section) => {
        if (section.plannedArrival && section.actualArrival) {
            acc.sum += (new Date(section.actualArrival).getTime() - new Date(section.plannedArrival).getTime()) / 60000;
            acc.n += 1; // use only non cancelled sections for average
        }
        return acc;
    }, { sum: 0, n: 0 }) as { sum: number, n: number };

    const averageArrivalDelay = res.sum / res.n;
    let delayMinutes: number, delaySeconds: number; // Fix: Add type annotations
    if (averageArrivalDelay < 0) {
        delayMinutes = 0;
        delaySeconds = 0;
    } else {
        delayMinutes = Math.floor(averageArrivalDelay);
        delaySeconds = Math.round((averageArrivalDelay - delayMinutes) * 60);
    }
    const delayColor = delayMinutes >= 2 ? "red" : delayMinutes >= 1 ? "orange" : "green";

    return <Card className="tl-container" onClick={onSelect} style={{ backgroundColor: selected ? "#f0f0f0" : "#ffffff" }}>
        <Flex justify="space-between">
            <Tag color="red">{lineName}</Tag>
            <b>{currentDateString}</b>
        </Flex>

        <Flex className="second-row" justify="space-between">
            <p>{name}</p>
            <p>Average Delay: <span style={{ color: delayColor }}>{delayMinutes}min {delaySeconds}s</span></p>
        </Flex>

        <Steps
            direction="horizontal"
            responsive={false}
            current={99}
            progressDot={customDot}
            items={sectionsAsSteps} />

    </Card >;
}

export default TrainLineView;