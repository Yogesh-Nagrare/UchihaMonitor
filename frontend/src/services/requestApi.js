import { apiSlice } from './apiSlice'

export const requestApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getRequestsByCollection: builder.query({
      query: (collectionId) => `/request/collection/${collectionId}`,
      providesTags: (result, error, collectionId) => [
        { type: 'Request', id: collectionId },
      ],
    }),

    createRequest: builder.mutation({
      query: (body) => ({
        url: '/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Request', id: arg.collectionId },
      ],
    }),

    updateRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/request/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
          { type: 'Request', id: arg.collectionId },
          'Request',
        ],
    }),

    deleteRequest: builder.mutation({
      query: (id) => ({
        url: `/request/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Request'],
    }),

  }),
})

export const {
  useGetRequestsByCollectionQuery,
  useCreateRequestMutation,
  useUpdateRequestMutation,
  useDeleteRequestMutation,
} = requestApi