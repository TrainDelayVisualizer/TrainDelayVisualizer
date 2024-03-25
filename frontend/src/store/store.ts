import { configureStore } from '@reduxjs/toolkit'
import stationReducer from './stationSlice'

const store = configureStore({
  reducer: {
    station: stationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store;