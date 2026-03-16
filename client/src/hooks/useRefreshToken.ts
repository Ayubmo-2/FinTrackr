import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../store/authSlice';
import { useCallback } from 'react';

export function useRefreshToken() {
  const dispatch = useDispatch();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          // Get current user info
          const userRes = await fetch('/api/user/me', {
            headers: { Authorization: `Bearer ${data.accessToken}` },
            credentials: 'include',
          });
          if (userRes.ok) {
            const user = await userRes.json();
            dispatch(setCredentials({ user, accessToken: data.accessToken }));
            return true;
          }
        }
      }
      dispatch(logout());
      return false;
    } catch {
      dispatch(logout());
      return false;
    }
  }, [dispatch]);

  return refresh;
}
