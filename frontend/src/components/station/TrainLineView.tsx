import React from "react";
import { Tag, Card, Flex, Steps } from "antd";
import "./TrainLineView.css";
import type { StepsProps } from 'antd';

type TLVProps = {
    selected: boolean,
    onSelect: () => void,
};

const customDot: StepsProps['progressDot'] = (dot) => (
    dot
);

function TrainLineView({ selected, onSelect }: TLVProps) {

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
            items={[
                {
                    title: "Rapperswil SG",
                    description: "12:03+3",
                },
                {
                    title: "Männedorf",
                    description: "12:15+3 | 12:18+6",
                },
                {
                    title: "EGG ZH",
                    description: "12:27+5 | 12:35+0",
                },
                {
                    title: "Luzern",
                    description: "13:10+4",
                },
            ]}
        />

    </Card>
}

export default TrainLineView;