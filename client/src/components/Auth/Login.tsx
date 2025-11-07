import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    const res = await api.post('/auth/login', data);
    setAuth(res.data.user, res.data.token);
    navigate('/dashboard');
  });

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input placeholder="Email" type="email" {...register('email', { required: true })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Password" type="password" {...register('password', { required: true })} className="w-full border rounded px-3 py-2" />
        <button className="w-full bg-black text-white rounded py-2">Login</button>
      </form>
      <p className="text-sm">No account? <Link to="/signup" className="underline">Sign up</Link></p>
    </div>
  );
}
