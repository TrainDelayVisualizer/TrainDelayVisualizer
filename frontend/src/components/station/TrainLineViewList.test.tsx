import React from 'react';
import { render, screen } from '@testing-library/react';
import '../../test/matchMedia.mock';
import TrainLineViewList from './TrainLineViewList';
import { TrainRide } from '../../model/TrainRide';

const mockTrainLines: TrainRide[] = [
    {
        name: 'Train 1',
        lineName: 'Line A',
        sections: [
            {
                stationFrom: { id: 1, description: 'Station A', lon: 0, lat: 0 },
                stationTo: { id: 2, description: 'Station B', lon: 1, lat: 1 },
                plannedArrival: '2024-05-10T09:00:00Z',
                plannedDeparture: '2024-05-10T08:00:00Z',
                isCancelled: false,
                actualDeparture: null,
                actualArrival: null,
                averageDepartureDelay: 0,
                averageArrivalDelay: 0
            },
            {
                stationFrom: { id: 2, description: 'Station B', lon: 1, lat: 1 },
                stationTo: { id: 3, description: 'Station C', lon: 2, lat: 2 },
                plannedArrival: '2024-05-10T10:00:00Z',
                plannedDeparture: '2024-05-10T09:30:00Z',
                isCancelled: false,
                actualDeparture: null,
                actualArrival: null,
                averageDepartureDelay: 0,
                averageArrivalDelay: 0
            }
        ],
        plannedStart: '2024-05-10T08:00:00Z'
    },
    {
        name: 'Train 2',
        lineName: 'Line B',
        sections: [
            {
                stationFrom: { id: 4, description: 'Station D', lon: 3, lat: 3 },
                stationTo: { id: 5, description: 'Station E', lon: 4, lat: 4 },
                plannedArrival: '2024-05-11T09:00:00Z',
                plannedDeparture: '2024-05-11T08:00:00Z',
                isCancelled: false,
                actualDeparture: null,
                actualArrival: null,
                averageDepartureDelay: 0,
                averageArrivalDelay: 0
            },
            {
                stationFrom: { id: 5, description: 'Station E', lon: 4, lat: 4 },
                stationTo: { id: 6, description: 'Station F', lon: 5, lat: 5 },
                plannedArrival: '2024-05-11T10:00:00Z',
                plannedDeparture: '2024-05-11T09:30:00Z',
                isCancelled: false,
                actualDeparture: null,
                actualArrival: null,
                averageDepartureDelay: 0,
                averageArrivalDelay: 0
            }
        ],
        plannedStart: '2024-05-11T08:00:00Z'
    }
];

describe('TrainLineViewList Component', () => {
    const mockSetPage = jest.fn();
    const mockOnSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render train lines and the correct pagination information when not loading', () => {
        render(
            <TrainLineViewList
                loading={false}
                trainLines={mockTrainLines}
                count={2}
                page={0}
                selectedIndex={0}
                onSelect={mockOnSelect}
                setPage={mockSetPage}
            />
        );

        expect(screen.getByText('Showing entries 1-2 / 2')).toBeInTheDocument();
        expect(screen.getByText('Train 1')).toBeInTheDocument();
        expect(screen.getByText('Train 2')).toBeInTheDocument();
    });

    it('should disable navigation buttons appropriately', () => {
        render(
            <TrainLineViewList
                loading={false}
                trainLines={mockTrainLines}
                count={2}
                page={0}
                selectedIndex={-1}
                onSelect={mockOnSelect}
                setPage={mockSetPage}
            />
        );

        expect(screen.getByRole('button', { name: /left/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /right/i })).toBeDisabled();
    });

    it('should display "No rides found for filter" when there is no data and showNoDataMessage is true', () => {
        render(
            <TrainLineViewList
                loading={false}
                trainLines={[]}
                count={0}
                page={0}
                selectedIndex={-1}
                onSelect={mockOnSelect}
                setPage={mockSetPage}
                showNoDataMessage={true}
            />
        );

        expect(screen.getByText('No rides found for filter')).toBeInTheDocument();
    });

    it('should not display any message when there is no data and showNoDataMessage is false', () => {
        render(
            <TrainLineViewList
                loading={false}
                trainLines={[]}
                count={0}
                page={0}
                selectedIndex={-1}
                onSelect={mockOnSelect}
                setPage={mockSetPage}
                showNoDataMessage={false}
            />
        );

        expect(screen.queryByText('No rides found for filter')).not.toBeInTheDocument();
    });
});
