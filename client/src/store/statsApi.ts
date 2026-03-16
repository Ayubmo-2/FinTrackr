import { baseApi } from './api';
import { SummaryStats } from '../../../shared/types';

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<SummaryStats, { month?: number; year?: number }>({
      query: (params) => ({ url: '/stats/summary', params }),
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetSummaryQuery } = statsApi;
