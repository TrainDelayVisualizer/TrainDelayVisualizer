import React from 'react';
import { render, screen } from '@testing-library/react';
import ColorLegend from './ColorLegend';

describe('ColorLegend', () => {
    it('renders the color legend component', () => {
        render(<ColorLegend isLineDelay={true} />);

        const noDelayBadge = screen.getByText('No delay');
        const minDelayBadge = screen.getByText('≥ 3 min delay');
        const cancelledBadge = screen.getByText('Cancelled');

        expect(noDelayBadge).toBeInTheDocument();
        expect(minDelayBadge).toBeInTheDocument();
        expect(cancelledBadge).toBeInTheDocument();
    });

    it('renders the color legend component with different delay values', () => {
        render(<ColorLegend isLineDelay={false} />);

        const noDelayBadge = screen.getByText('No delay');
        const avgDelayBadge = screen.getByText('≥ 1 min Ø delay');
        const cancelledBadge = screen.getByText('Cancelled');

        expect(noDelayBadge).toBeInTheDocument();
        expect(avgDelayBadge).toBeInTheDocument();
        expect(cancelledBadge).toBeInTheDocument();
    });
});