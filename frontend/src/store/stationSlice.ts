import { createSlice, PayloadAction, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { serverUrl } from '../util/request'

export interface Station {
  id: number,
  description: string,
  descriptionShort: string,
  lon: number,
  lat: number,
}

interface StationState {
  all: Array<Station>,
  status: string,
}

const initialState: StationState = {
  all: [],
  status: "idle",
}

export const fetchStations = createAsyncThunk<
  Array<Station>
>('stations', async () => {
  const response = await fetch(serverUrl() + '/stations')
  return await response.json() as Array<Station>
})

export const stationSlice = createSlice({
  name: 'station',
  initialState,
  reducers: {
    setAll(state: StationState, action: PayloadAction<Array<Station>>) {
      state.all = action.payload
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<StationState>) => {
    builder
      .addCase(fetchStations.pending, (state: StationState) => {
        state.status = 'loading'
      })
      .addCase(fetchStations.fulfilled, (state: StationState, action: PayloadAction<Array<Station>>) => {
        console.log("Thunk fulfilled", action)
        state.all = action.payload
        state.status = 'idle'
      })
      .addCase(fetchStations.rejected, (state: StationState) => {
        console.error("Could not load stations");
        state.status = 'failed'
      })
  }
})

export const { } = stationSlice.actions
export default stationSlice.reducer