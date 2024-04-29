import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { serverUrl } from '../util/request';
import type { Section } from '../model/Section';

interface SectionState {
    all: Array<Section>,
    status: string,
}

const initialState: SectionState = {
    all: [],
    status: "idle",
};

const TIMEOUT = 5000;

export const fetchSections = createAsyncThunk<
    Array<Section>
>('sections', async () => {
    const fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    fromDate.setDate(fromDate.getDate() - 1);
    const toDate = new Date();
    toDate.setDate(toDate.getDate() - 1);
    toDate.setHours(23, 59, 59, 999);

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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSections.pending, (state: SectionState) => {
                state.status = 'loading';
            })
            .addCase(fetchSections.fulfilled, (state: SectionState, action: PayloadAction<Array<Section>>) => {
                state.all = action.payload;
                state.status = 'idle';
            })
            .addCase(fetchSections.rejected, (state: SectionState) => {
                state.status = 'failed';
            });
    }
});

export default sectionSlice.reducer;