import { createSlice } from '@reduxjs/toolkit'

const historySlice = createSlice({
  name: 'history',
  initialState: {
    entries: [],
  },
  reducers: {},
})

export default historySlice.reducer