import '../../test/matchMedia.mock';

import React from 'react';
import { render, screen } from '@testing-library/react';
import TableContainer from './TableContainer';

describe('TableContainer', () => {
  it('renders without error', async () => {
    render(<TableContainer />);
    
    const containerTitle = await screen.findByTestId('table-container-title');

    expect(containerTitle).toBeInTheDocument();
  });

  // Add more test cases as needed
});