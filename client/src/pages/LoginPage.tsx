import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { TrendingUp } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Invalid email or password');
        return;
      }
      dispatch(setCredentials({ user: json.user, accessToken: json.accessToken }));
      navigate('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-600" size={28} />
            <span className="text-2xl font-bold text-gray-900">FinTrackr</span>
          </div>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>
        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Sign In</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
