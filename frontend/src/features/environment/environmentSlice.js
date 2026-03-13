import { createSlice } from '@reduxjs/toolkit'

const environmentSlice = createSlice({
  name: 'environment',
  initialState: {
    activeEnvironmentId: null,
  },
  reducers: {
    setActiveEnvironmentId: (state, action) => {
      state.activeEnvironmentId = action.payload
    },
  },
})

export const { setActiveEnvironmentId } = environmentSlice.actions
export default environmentSlice.reducer