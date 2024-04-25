import React from "react";
import TrainLineView, { LoadingComponent } from "./TrainLineView";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { TrainLineViewListProps } from "../../model/props/TrainLineViewListProps";
import { TrainRide } from "../../model/TrainRide";

function TrainLineViewList({ loading, trainLines, count, page, selectedIndex, onSelect, setPage, showNoDataMessage = true }: TrainLineViewListProps) {
  return (
    <div>
      <div className="table-control" style={{ visibility: count > 0 ? 'visible' : 'hidden' }}>
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