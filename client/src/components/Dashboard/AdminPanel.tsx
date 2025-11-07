import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

export default function AdminPanel() {
  const { logout, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users', { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => setUsers(r.data.items));
  }, [token]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button onClick={() => logout()} className="px-3 py-1 rounded bg-gray-200">Logout</button>
      </div>
      <section>
        <h2 className="font-medium mb-2">Users</h2>
        <ul className="space-y-1">
          {users.map(u => (
            <li key={u.email} className="flex justify-between border p-2 rounded">
              <span>{u.name} — {u.email} ({u.role})</span>
              <span className="text-sm">{u.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
