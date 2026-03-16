import { baseApi } from './api';
import { Transaction, PaginatedResponse } from '../../../shared/types';

interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: string;
}

interface CreateTransactionDto {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<PaginatedResponse<Transaction>, TransactionFilters>({
      query: (params) => ({ url: '/transactions', params }),
      providesTags: ['Transaction'],
    }),
    createTransaction: builder.mutation<Transaction, CreateTransactionDto>({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: ['Transaction', 'Stats'],
    }),
    updateTransaction: builder.mutation<Transaction, Partial<CreateTransactionDto> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/transactions/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Transaction', 'Stats'],
    }),
    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({ url: `/transactions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Transaction', 'Stats'],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionsApi;
