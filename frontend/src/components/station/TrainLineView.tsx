import React from "react";
import { Tag, Card, Flex, Steps } from "antd";
import "./TrainLineView.css";
import { StepsProps, Skeleton } from 'antd';
import type { Section } from "./TrainLineViewList";
import store from '../../store/store';

type TLVProps = {
    selected: boolean,
    onSelect: () => void,
    name: string,
    lineName: string,
    sections: Array<Section>
};

const customDot: StepsProps['progressDot'] = (dot) => (
    dot
);
const customDescription = (plannedArrival: string | null, actualArrival: string | null, plannedDeparture: string | null, actualDeparture: string | null) => {
    let arrivalDelay, departureDelay, arrivalDelayColor, departureDelayColor;
    if (plannedArrival !== null && actualArrival !== null) {
        arrivalDelay = Math.round((new Date(actualArrival).getTime() - new Date(plannedArrival).getTime()) / 60000);
        arrivalDelay = arrivalDelay < 0 ? 0 : arrivalDelay;
        arrivalDelayColor = arrivalDelay >= 6 ? "red" : arrivalDelay >= 3 ? "orange" : "green";
    }
    if (plannedDeparture !== null && actualDeparture !== null) {
        departureDelay = Math.round((new Date(actualDeparture).getTime() - new Date(plannedDeparture).getTime()) / 60000);
        departureDelay = departureDelay < 0 ? 0 : departureDelay;
        departureDelayColor = departureDelay >= 6 ? "red" : departureDelay >= 3 ? "orange" : "green";
    }

    if (!plannedArrival && plannedDeparture) {
        return (
            <div>{new Date(plannedDeparture).toLocaleTimeString().slice(0, 5)} <span style={{ color: departureDelayColor }}>+{departureDelay}</span></div>
        )
    } else if (!plannedDeparture && plannedArrival) {
        return (
            <div>{new Date(plannedArrival).toLocaleTimeString().slice(0, 5)} <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span></div>
        )
    } else if (plannedArrival && plannedDeparture) {
        return (
            <div>{new Date(plannedArrival).toLocaleTimeString().slice(0, 5)} <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span> | {new Date(plannedDeparture).toLocaleTimeString().slice(0, 5)} <span style={{ color: departureDelayColor }}>+{departureDelay}</span></div>
        )
    } else {
        return <div>??</div>

    }
};

export function LoadingComponent() {
    return <Card>
        <Flex justify="space-between">
            <div>
                <Skeleton.Button active size="small" />
            </div>
            <Skeleton.Button active size="small" />
        </Flex>

        <Flex className="second-row" justify="space-between">
            <Skeleton.Button active size="small" style={{ width: '80px' }} />
            <Skeleton.Button active size="small" style={{ width: '150px' }} />
            <Skeleton.Button active size="small" style={{ width: '100px' }} />
        </Flex>

        <Steps
            current={10}
            progressDot={customDot}
        >
            <Steps.Step title={<Skeleton.Button active style={{ width: '80px' }} />} />
            <Steps.Step title={<Skeleton.Button active style={{ width: '100px' }} />} />
            <Steps.Step title={<Skeleton.Button active style={{ width: '50px' }} />} />
            <Steps.Step title={<Skeleton.Button active style={{ width: '70px' }} />} />
        </Steps>

    </Card>
}

function TrainLineView({ selected, onSelect, name, lineName, sections }: TLVProps) {
    const d = new Date();
    const currentDateString = `${("0" + d.getDate()).slice(-2)}.${("0" + (d.getMonth() + 1)).slice(-2)}.${d.getFullYear()}`;

    const sectionsAsSteps = [];
    for (let i = 0; i < sections.length; i++) {
        const prevSection = sections[i - 1];
        const section = sections[i];
        sectionsAsSteps.push({
            title: store.getState().station.allById[section.stationFromId].description,
            description: customDescription(prevSection?.plannedArrival, prevSection?.actualArrival, section.plannedDeparture, section.actualDeparture)
        })
    }
    const lastSection = sections[sections.length - 1];
    sectionsAsSteps.push({
        title: store.getState().station.allById[lastSection.stationToId].description,
        description: customDescription(lastSection.plannedArrival, lastSection.actualArrival, null, null)
    })

    const averageArrivalDelay = sections.reduce((acc, section) => {
        if (section.plannedArrival && section.actualArrival) {
            return acc + (new Date(section.actualArrival).getTime() - new Date(section.plannedArrival).getTime()) / 60000;
        } else {
            return acc;
        }
    }, 0) / sections.length;
    let delayMinutes, delaySeconds;
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
            <div>
                <Tag color="red">{lineName}</Tag>
            </div>
        </Flex>

        <Flex className="second-row" justify="space-between">
            <b>{currentDateString}</b>
            <p>{name}</p>
            <p>Average Delay: <span style={{ color: delayColor }}>{delayMinutes}min {delaySeconds}s</span></p>
        </Flex>

        <Steps
            current={sections.length}
            progressDot={customDot}
        >
            {sectionsAsSteps.map((section, i) => <Steps.Step key={i} title={section.title} description={section.description} />)}
        </Steps>

    </Card >
}

export default TrainLineView;