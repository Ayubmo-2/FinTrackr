import { baseApi } from './api';
import { Budget } from '../../../shared/types';

interface BudgetWithStats extends Budget {
  spent: number;
  percent: number;
}

interface CreateBudgetDto {
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}

export const budgetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBudgets: builder.query<{ budgets: BudgetWithStats[] }, { month?: number; year?: number }>({
      query: (params) => ({ url: '/budgets', params }),
      providesTags: ['Budget'],
    }),
    upsertBudget: builder.mutation<Budget, CreateBudgetDto>({
      query: (body) => ({ url: '/budgets', method: 'POST', body }),
      invalidatesTags: ['Budget'],
    }),
    deleteBudget: builder.mutation<void, string>({
      query: (id) => ({ url: `/budgets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Budget'],
    }),
  }),
});

export const { useGetBudgetsQuery, useUpsertBudgetMutation, useDeleteBudgetMutation } = budgetsApi;
