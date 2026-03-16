import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from './index';
import { setAccessToken, logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra
) => {
  let result = await baseQuery(args, api, extra);
  if (result.error?.status === 401 || result.error?.status === 403) {
    const refresh = await baseQuery({ url: '/auth/refresh', method: 'POST' }, api, extra);
    if (refresh.data && (refresh.data as any).accessToken) {
      api.dispatch(setAccessToken((refresh.data as any).accessToken));
      result = await baseQuery(args, api, extra);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaction', 'Budget', 'Stats', 'User'],
  endpoints: () => ({}),
});
