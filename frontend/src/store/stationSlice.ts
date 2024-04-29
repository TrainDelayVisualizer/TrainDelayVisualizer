import { createSlice, PayloadAction, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { serverUrl } from '../util/request';
import type { Station } from '../model/Station';

interface StationState {
    all: Array<Station>,
    allById: Array<Station>,
    status: string,
}

const initialState: StationState = {
    all: [],
    allById: [],
    status: "idle",
};

export const fetchStations = createAsyncThunk<
    Array<Station>
>('stations', async () => {
    const response = await fetch(serverUrl() + '/stations')
        .then(res => res.json());
    return response as Array<Station>;
});

export const stationSlice = createSlice({
    name: 'station',
    initialState,
    reducers: {
        setAll(state: StationState, action: PayloadAction<Array<Station>>) {
            state.all = action.payload;
        }
    },
    extraReducers: (builder: ActionReducerMapBuilder<StationState>) => {
        builder
            .addCase(fetchStations.pending, (state: StationState) => {
                state.status = 'loading';
            })
            .addCase(fetchStations.fulfilled, (state: StationState, action: PayloadAction<Array<Station>>) => {
                state.all = action.payload;
                state.status = 'idle';
                state.allById = action.payload.reduce((acc: Array<Station>, station) => {
                    acc[station.id] = station;
                    return acc;
                }, [] as Array<Station>);
            })
            .addCase(fetchStations.rejected, (state: StationState) => {
                state.status = 'failed';
            });
    }
});

export default stationSlice.reducer;