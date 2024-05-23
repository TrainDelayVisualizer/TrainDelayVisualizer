import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { serverUrl } from '../util/request';
import type { Section } from '../model/Section';
import { getMidnightYesterday } from "../util/date.util";

interface SectionState {
    all: Array<Section>,
    filtered: Array<Section>,
    status: string,
}

const initialState: SectionState = {
    all: [],
    filtered: [],
    status: "idle",
};

type Filter = {
    fromDate: Date,
    fromTime: Date | undefined,
    toTime: Date | undefined,
    line: string | undefined,
    trainType: string | undefined,
};

const TIMEOUT = 60000;

export const fetchSections = createAsyncThunk<
    Array<Section>,
    Filter | undefined
>('sections', async ({ fromDate, fromTime, toTime, line, trainType }: Filter = { fromDate: getMidnightYesterday(), fromTime: undefined, toTime: undefined, line: undefined, trainType: undefined }) => {
    if (fromTime) {
        fromDate.setHours(fromTime.getHours(), fromTime.getMinutes(), fromTime.getSeconds(), fromTime.getMilliseconds());
    } else {
        fromDate.setHours(0, 0, 0, 0);
    }
    const toDate = new Date(fromDate);
    if (toTime) {
        toDate.setHours(toTime.getHours(), toTime.getMinutes(), toTime.getSeconds(), toTime.getMilliseconds());
    } else {
        toDate.setHours(23, 59, 59, 999);
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(serverUrl() + '/sections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: fromDate,
            to: toDate,
            delaysOnly: false,
            trainLine: line,
            trainType: trainType,
        }),
        signal: controller.signal
    });
    clearTimeout(id);
    return await response.json() as Array<Section>;
});

export const sectionSlice = createSlice({
    name: 'section',
    initialState,
    reducers: {
        setAll(state: SectionState, action: PayloadAction<Array<Section>>) {
            state.all = action.payload;
            state.filtered = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSections.pending, (state: SectionState) => {
                state.status = 'loading';
            })
            .addCase(fetchSections.fulfilled, (state: SectionState, action: PayloadAction<Array<Section>>) => {
                state.all = action.payload;
                state.filtered = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchSections.rejected, (state: SectionState) => {
                state.status = 'failed';
            });
    }
});

export default sectionSlice.reducer;