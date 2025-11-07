import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const res = await api.post('/auth/admin/login', data);
    setAuth(res.data.user, res.data.token);
    navigate('/admin');
  });

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input placeholder="Admin Email" type="email" {...register('email', { required: true })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Password" type="password" {...register('password', { required: true })} className="w-full border rounded px-3 py-2" />
        <button className="w-full bg-black text-white rounded py-2">Login</button>
      </form>
    </div>
  );
}
