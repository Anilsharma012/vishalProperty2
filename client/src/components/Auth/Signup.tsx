import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { register, handleSubmit } = useForm<{ name: string; email: string; password: string }>();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const res = await api.post('/auth/signup', data);
    setAuth(res.data.user, res.data.token);
    navigate('/dashboard');
  });

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input placeholder="Name" {...register('name', { required: true })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Email" type="email" {...register('email', { required: true })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Password" type="password" {...register('password', { required: true, minLength: 6 })} className="w-full border rounded px-3 py-2" />
        <button className="w-full bg-black text-white rounded py-2">Create Account</button>
      </form>
    </div>
  );
}
