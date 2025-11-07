import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

type Property = { title: string; price: number; location: string; description: string };

export default function PropertyDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState<Property | null>(null);
  useEffect(() => { if (slug) api.get(`/properties/${slug}`).then(r => setItem(r.data.item)); }, [slug]);
  if (!item) return <div className="p-6">Loading...</div>;
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-semibold">{item.title}</h1>
      <div className="text-gray-700">{item.location}</div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: item.description }} />
    </div>
  );
}
