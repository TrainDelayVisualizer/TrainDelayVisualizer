import React from "react";
import { Badge, Card, Space } from "antd";
import "./ColorLegend.css";
import { ColorLegendProps } from "../../model/props/ColorLegendProps";

function ColorLegend({ isLineDelay }: ColorLegendProps) {
    return (
        <Card title="Delay Legend" className="color-legend">
            <Space direction="vertical">
                <Badge color="darkgreen" text="No delay" />
                <Badge color="orange" text={`≥ ${isLineDelay ? 3 : 1} min ${isLineDelay ? "" : "Ø"} delay`} />
                <Badge color="red" text={`≥ ${isLineDelay ? 5 : 2} min ${isLineDelay ? "" : "Ø"} delay`} />
                <Badge color="black" text="Cancelled" />
            </Space>
        </Card>
    );
}

export default ColorLegend;