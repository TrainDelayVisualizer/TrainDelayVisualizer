import React from "react";
import { Tag, Card, Flex, Steps } from "antd";
import "./TrainLineView.css";
import { StepsProps, Skeleton, StepProps } from 'antd';
import { TrainLineViewProps } from "../../model/props/TrainLineViewProps";
import { DelayCalculationUtils } from "../../util/delay-calculation.utils";
import { Section } from "../../model/Section";

const customDot: StepsProps['progressDot'] = (dot) => (
    dot
);

const LONG_DELAY = 6;
const MEDIUM_DELAY = 3;

export const calcSectionDelays = (sections: Section[]) => {
    return sections.reduce((acc: { arrivalSum: number, arrivalN: number, departureSum: number, departureN: number; }, section) => {
        if (section.actualArrival) {
            acc.arrivalSum += section.averageArrivalDelay; // average delay for a single section is just its delay
            acc.arrivalN += 1; // use only sections with valid delay for average
        }
        if (section.actualDeparture) {
            acc.departureSum += section.averageDepartureDelay;  // average delay for a single section is just its delay
            acc.departureN += 1; // use only sections with valid delay for average
        }
        return acc;
    }, { arrivalSum: 0, arrivalN: 0, departureSum: 0, departureN: 0 });
};

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
            <div>{new Date(plannedDeparture).toLocaleTimeString().slice(0, 5)} {departureDelay !== undefined ? <span style={{ color: departureDelayColor }}>+{departureDelay}</span> : null}</div>
        );
    } else if (!plannedDeparture && plannedArrival) {
        return (
            <div>{new Date(plannedArrival).toLocaleTimeString().slice(0, 5)} {arrivalDelay !== undefined ? <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span> : null}</div>
        );
    } else if (plannedArrival && plannedDeparture) {
        return (
            <div>{new Date(plannedArrival).toLocaleTimeString().slice(0, 5)} {arrivalDelay !== undefined ? <span style={{ color: arrivalDelayColor }}>+{arrivalDelay}</span> : null} | {new Date(plannedDeparture).toLocaleTimeString().slice(0, 5)} {departureDelay !== undefined ? <span style={{ color: departureDelayColor }}>+{departureDelay}</span> : null}</div>
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

    const res = calcSectionDelays(sections);

    const averageArrivalDelay = res.arrivalN > 0 ? res.arrivalSum / res.arrivalN : 0;
    const averageDepartureDelay = res.departureN > 0 ? res.departureSum / res.departureN : 0;
    const { delayColor: arrivalDelayColor, delayMinutes: arrivalDelayMinutes, delaySeconds: arrivalDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(averageArrivalDelay);
    const { delayColor: departureDelayColor, delayMinutes: departureDelayMinutes, delaySeconds: departureDelaySeconds } = DelayCalculationUtils.calculateDelayInfo(averageDepartureDelay);

    return <Card className="tl-container" onClick={onSelect} style={{ backgroundColor: selected ? "#f0f0f0" : "#ffffff" }}>
        <Flex justify="space-between">
            <b>{currentDateString}</b>
            <div>
                <p>Ø Arrival Delay: <span style={{ color: arrivalDelayColor }}>{arrivalDelayMinutes}min {arrivalDelaySeconds}s</span></p>
                <p>Ø Departure Delay: <span style={{ color: departureDelayColor }}>{departureDelayMinutes}min {departureDelaySeconds}s</span></p>
            </div>
        </Flex>

        <div>
            <Tag data-testid="line-name" color="red">{lineName}</Tag>
            <p className="line-info">{name}</p>
        </div>

        <Steps
            direction="horizontal"
            responsive={false}
            current={99}
            progressDot={customDot}
            items={sectionsAsSteps} />

    </Card >;
}

export default TrainLineView;