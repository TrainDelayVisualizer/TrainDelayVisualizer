import { TrainRide } from "../TrainRide";

export type TrainLineViewListProps = {
  loading: boolean;
  trainLines: Array<TrainRide>;
  count: number;
  page: number;
  selectedIndex: number;
  onSelect?: (index: number) => void;
  setPage: (page: number) => void;
  showNoDataMessage?: boolean;
};