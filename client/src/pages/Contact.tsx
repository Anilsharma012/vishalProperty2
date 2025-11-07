import { useForm } from 'react-hook-form';
import api from '../lib/api';

export default function Contact() {
  const { register, handleSubmit, reset } = useForm<{ name: string; email?: string; phone: string; message: string }>();
  const onSubmit = handleSubmit(async (data) => {
    await api.post('/enquiries', data);
    reset();
    alert('Enquiry submitted');
  });
  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input placeholder="Name" {...register('name', { required: true })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Email" type="email" {...register('email')} className="w-full border rounded px-3 py-2" />
        <input placeholder="Phone" {...register('phone', { required: true })} className="w-full border rounded px-3 py-2" />
        <textarea placeholder="Message" {...register('message', { required: true })} className="w-full border rounded px-3 py-2 min-h-[120px]"></textarea>
        <button className="w-full bg-black text-white rounded py-2">Send</button>
      </form>
    </div>
  );
}
