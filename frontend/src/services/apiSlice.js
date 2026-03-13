import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    credentials: 'include', // sends cookies automatically
  }),
  tagTypes: ['Collection', 'Request', 'Environment', 'History', 'Auth'],
  endpoints: () => ({}),
})
