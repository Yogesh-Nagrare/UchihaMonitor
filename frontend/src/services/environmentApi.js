import { apiSlice } from './apiSlice'

export const environmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getEnvironments: builder.query({
      query: () => '/environment',
      providesTags: ['Environment'],
    }),

    createEnvironment: builder.mutation({
      query: (body) => ({ url: '/environment', method: 'POST', body }),
      invalidatesTags: ['Environment'],
    }),

    updateEnvironment: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/environment/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Environment'],
    }),

    deleteEnvironment: builder.mutation({
      query: (id) => ({ url: `/environment/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Environment'],
    }),

    activateEnvironment: builder.mutation({
      query: (id) => ({ url: `/environment/${id}/activate`, method: 'PATCH' }),
      invalidatesTags: ['Environment'],
    }),

    getActiveEnvironment: builder.query({
      query: () => '/environment/active',
      providesTags: ['Environment'],
    }),

  }),
})

export const {
  useGetEnvironmentsQuery,
  useCreateEnvironmentMutation,
  useUpdateEnvironmentMutation,
  useDeleteEnvironmentMutation,
  useActivateEnvironmentMutation,
  useGetActiveEnvironmentQuery,
} = environmentApi