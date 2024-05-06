import { configureStore } from '@reduxjs/toolkit'
import stationReducer from './stationSlice'
import sectionReducer from './sectionSlice'
import lineReducer from './lineSlice'

const store = configureStore({
  reducer: {
    station: stationReducer,
    section: sectionReducer,
    line: lineReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store;