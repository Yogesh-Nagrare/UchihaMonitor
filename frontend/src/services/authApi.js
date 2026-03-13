import { apiSlice } from './apiSlice'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /auth/me — check if cookie session is valid
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    // POST /auth/logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

  }),
})

export const { useGetMeQuery, useLogoutMutation } = authApi