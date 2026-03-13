import { apiSlice } from './apiSlice'

export const historyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getHistory: builder.query({
      query: ({ page = 1, limit = 50, method, search } = {}) => {
        const params = new URLSearchParams({ page, limit })
        if (method) params.append('method', method)
        if (search) params.append('search', search)
        return `/history?${params}`
      },
      providesTags: ['History'],
    }),

    logHistory: builder.mutation({
      query: (body) => ({ url: '/history', method: 'POST', body }),
      invalidatesTags: ['History'],
    }),

    deleteHistoryEntry: builder.mutation({
      query: (id) => ({ url: `/history/${id}`, method: 'DELETE' }),
      invalidatesTags: ['History'],
    }),

    clearHistory: builder.mutation({
      query: () => ({ url: '/history/clear/all', method: 'DELETE' }),
      invalidatesTags: ['History'],
    }),

  }),
})

export const {
  useGetHistoryQuery,
  useLogHistoryMutation,
  useDeleteHistoryEntryMutation,
  useClearHistoryMutation,
} = historyApi