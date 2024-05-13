import { createSlice, PayloadAction, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { serverUrl } from '../util/request';
import type { Line } from '../model/Line';

interface LineState {
    all: Array<string>,
    types: Array<string>,
}

const initialState: LineState = {
    all: [],
    types: [],
};

const TIMEOUT = 5000;

export const fetchLines = createAsyncThunk<
    Array<Line>
>('lines', async () => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(serverUrl() + '/lines', { signal: controller.signal });
    clearTimeout(id);
    return await response.json() as Array<Line>;
});

export const lineSlice = createSlice({
    name: 'line',
    initialState,
    reducers: {
        setAll(state: LineState, action: PayloadAction<Array<Line>>) {
            const all: Array<string> = [];
            const types: Array<string> = [];
            action.payload.forEach((line) => {
                all.push(line.name);
                if (!types.includes(line.trainType)) {
                    types.push(line.trainType);
                }
            });
            all.sort();
            types.sort();
            state.all = all;
            state.types = types;
        }
    },
    extraReducers: (builder: ActionReducerMapBuilder<LineState>) => {
        builder
            .addCase(fetchLines.fulfilled, (state: LineState, action: PayloadAction<Array<Line>>) => {
                lineSlice.caseReducers.setAll(state, action);
            });
    }
});

export default lineSlice.reducer;