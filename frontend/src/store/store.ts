import { configureStore } from '@reduxjs/toolkit'
import stationReducer from './stationSlice'
import sectionReducer from './sectionSlice'

const store = configureStore({
  reducer: {
    station: stationReducer,
    section: sectionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store;