import { useAuth } from '../../auth/AuthContext';

export default function UserPanel() {
  const { user, logout } = useAuth();
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
        <button onClick={() => logout()} className="px-3 py-1 rounded bg-gray-200">Logout</button>
      </div>
      <p>Your dashboard is under construction.</p>
    </div>
  );
}
