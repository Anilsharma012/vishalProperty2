import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

type Property = { _id: string; title: string; slug: string; price: number; location: string };

export default function AllListings() {
  const [items, setItems] = useState<Property[]>([]);
  useEffect(() => { api.get('/properties').then(r => setItems(r.data.items)); }, []);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">All Listings</h1>
      <ul className="space-y-2">
        {items.map(p => (
          <li key={p._id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">{p.location}</div>
            </div>
            <Link to={`/property/${p.slug}`} className="underline">View</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
