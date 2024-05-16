/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LineStatisticContainer from './LineStatisticContainer';
import { Provider } from "react-redux";
import store from "../../store/store";

describe('LineStatisticContainer', () => {
    beforeEach(() => {
        // Mock the fetchLines function from the store
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        jest.spyOn(require('../../store/lineSlice'), 'fetchLines').mockReturnValue(jest.fn());
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(), // Deprecated
                removeListener: jest.fn(), // Deprecated
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    it('should render the component', () => {
        render(<Provider store={store}><LineStatisticContainer /></Provider>);
        expect(screen.getByTestId('table-container-title')).toBeInTheDocument();
    });

    it('should display the number of results found', () => {
        render(<Provider store={store}><LineStatisticContainer /></Provider>);
        expect(screen.getByText('No results found')).toBeInTheDocument();

        // Mock the line statistics data
        const mockLineStatistics = [
            {
                name: 'Line A',
                averageArrivalDelaySeconds: 120,
                averageDepartureDelaySeconds: 60
            },
            {
                name: 'Line B',
                averageArrivalDelaySeconds: 180,
                averageDepartureDelaySeconds: 90
            }
        ];

        // Mock the fetch function to return the line statistics data
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockLineStatistics)
        } as any);

        // Trigger the fetch and rendering of line statistics
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        jest.spyOn(React, 'useState').mockReturnValueOnce(['', jest.fn()]);

        expect(screen.getByText('2 results found')).toBeInTheDocument();
    });

    it('should display loading skeleton when loading', () => {
        // Mock the fetch function to return the line statistics data
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce([])
        } as any);
        render(<Provider store={store}><LineStatisticContainer /></Provider>);
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();

        // Mock the loading state
        jest.spyOn(React, 'useState').mockReturnValueOnce([true, jest.fn()]);

        render(<Provider store={store}><LineStatisticContainer /></Provider>);
        expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should display line statistics', () => {
        // Mock the line statistics data
        const mockLineStatistics = [
            {
                name: 'Line A',
                averageArrivalDelaySeconds: 120,
                averageDepartureDelaySeconds: 60
            },
            {
                name: 'Line B',
                averageArrivalDelaySeconds: 180,
                averageDepartureDelaySeconds: 90
            }
        ];

        // Mock the fetch function to return the line statistics data
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockLineStatistics)
        } as any);

        render(<Provider store={store}><LineStatisticContainer /></Provider>);

        // Trigger the fetch and rendering of line statistics
        //fireEvent.click(screen.getByRole('DatePicker', { name: /search/i }));

        // Check if the line statistics are displayed correctly
        expect(screen.getByText('Line A')).toBeInTheDocument();
        expect(screen.getByText('Ø Arrival Delay: 2min 0s')).toBeInTheDocument();
        expect(screen.getByText('Ø Departure Delay: 1min 0s')).toBeInTheDocument();

        expect(screen.getByText('Line B')).toBeInTheDocument();
        expect(screen.getByText('Ø Arrival Delay: 3min 0s')).toBeInTheDocument();
        expect(screen.getByText('Ø Departure Delay: 1min 30s')).toBeInTheDocument();
    });
});