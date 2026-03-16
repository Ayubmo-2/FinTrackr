import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    dispatch(logout());
  };

  return { user, accessToken, isAuthenticated, logout: handleLogout };
}
