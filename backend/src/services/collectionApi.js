import { apiSlice } from './apiSlice'

export const collectionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── Get all collections ───────────────────────────────────────
    getCollections: builder.query({
      query: () => '/collection',
      providesTags: ['Collection'],
    }),

    // ── Get single collection ─────────────────────────────────────
    getCollection: builder.query({
      query: (id) => `/collection/${id}`,
      providesTags: (result, error, id) => [{ type: 'Collection', id }],
    }),

    // ── Create collection ─────────────────────────────────────────
    createCollection: builder.mutation({
      query: (body) => ({
        url: '/collection',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Collection'],
    }),

    // ── Update collection ─────────────────────────────────────────
    updateCollection: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/collection/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Collection'],
    }),

    // ── Delete collection ─────────────────────────────────────────
    deleteCollection: builder.mutation({
      query: (id) => ({
        url: `/collection/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Collection', 'Request'],
    }),

    // ── Share collection ──────────────────────────────────────────
    shareCollection: builder.mutation({
      query: (id) => ({
        url: `/collection/${id}/share`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Collection'],
    }),

    // ── Unshare collection ────────────────────────────────────────
    unshareCollection: builder.mutation({
      query: (id) => ({
        url: `/collection/${id}/unshare`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Collection'],
    }),

    // ── Get shared collection (public — no auth) ──────────────────
    getSharedCollection: builder.query({
      query: (token) => `/collection/shared/${token}`,
    }),

    // ── Export collection as JSON ─────────────────────────────────
    exportCollection: builder.query({
      query: (id) => `/collection/${id}/export`,
    }),

    // ── Import collection from JSON ───────────────────────────────
    importCollection: builder.mutation({
      query: (body) => ({
        url: '/collection/import',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Collection', 'Request'],
    }),

  }),
})

export const {
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useShareCollectionMutation,
  useUnshareCollectionMutation,
  useGetSharedCollectionQuery,
  useExportCollectionQuery,
  useImportCollectionMutation,
} = collectionApi