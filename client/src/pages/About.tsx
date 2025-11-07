import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function About() {
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  useEffect(() => { api.get('/pages/about').then(r => setPage(r.data.page)).catch(() => setPage({ title: 'About', content: 'About content not set yet.' })); }, []);
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-semibold">{page?.title || 'About'}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
    </div>
  );
}
