import React from "react";
import TrainLineView, { LoadingComponent } from "./TrainLineView";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";

type TrainLineViewListProps = {
  loading: boolean;
  trainLines: Array<TrainRide>;
  count: number;
  page: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  setPage: (page: number) => void;
  showNoDataMessage?: boolean;
};

export type Section = {
  stationFromId: number,
  stationToId: number,
  plannedArrival: string | null,
  plannedDeparture: string | null,
  actualDeparture: string | null,
  actualArrival: string | null,
};

type TrainRide = {
  name: string;
  lineName: string;
  sections: Array<Section>;
};

function TrainLineViewList({ loading, trainLines, count, page, selectedIndex, onSelect, setPage, showNoDataMessage = true }: TrainLineViewListProps) {
  return (
    <div>
      <div className="table-control">
        <Button type="primary" shape="circle" icon={<LeftOutlined />} size="small" disabled={page == 0} onClick={() => setPage(page - 1)} />
        <p>Showing entries {page * 20 + 1}-{(page + 1) * 20 > count ? count : (page + 1) * 20} / {count}</p>
        <Button type="primary" shape="circle" icon={<RightOutlined />} size="small" disabled={(page + 1) * 20 >= count} onClick={() => setPage(page + 1)} />
      </div>

      {loading ? <div>{[...Array(20)].map((_, i) => <LoadingComponent key={i} />)}</div> : count > 0 ?
        <div>
          {
            trainLines.map((ride: TrainRide, i: number) => <TrainLineView key={i} selected={selectedIndex == i} name={ride.name} lineName={ride.lineName} sections={ride.sections} onSelect={() => onSelect(i)} />)
          }
        </div> : <div>{showNoDataMessage ? 'No rides found for filter' : ''}</div>
      }
    </div>
  );
}

export default TrainLineViewList;