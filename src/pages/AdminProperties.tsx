import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Property { _id?: string; title: string; description?: string; price: number; location: string; propertyType: string; status?: string; slug?: string; images?: string[]; }

export default function AdminProperties() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Property>({ title: '', description: '', price: 0, location: '', propertyType: 'flat', status: 'approved', images: [] });

  useEffect(() => { if (!loading && (!user || user.role !== 'admin')) navigate('/admin/login'); }, [user, loading, navigate]);
  useEffect(() => { if (user?.role === 'admin') loadProperties(); }, [user]);

  const loadProperties = async () => {
    const { data } = await api.get('/properties?status=approved');
    setProperties(data.items || []);
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const generateSlug = (title: string) => `${slugify(title)}-${Math.random().toString(36).slice(2,6)}`;

  const handleSave = async () => {
    if (!formData.title || !formData.price || !formData.location || !formData.propertyType) { toast.error('Please fill in required fields'); return; }
    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/properties/${editingId}`, formData);
        toast.success('Property updated');
      } else {
        await api.post('/properties', { ...formData, slug: generateSlug(formData.title) }, { headers: authHeader() });
        toast.success('Property created');
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: '', description: '', price: 0, location: '', propertyType: 'flat', status: 'approved', images: [] });
      loadProperties();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save property');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return; if (!confirm('Are you sure?')) return;
    try { await api.delete(`/properties/${id}`); toast.success('Deleted'); loadProperties(); } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to delete'); }
  };

  const handleEdit = (p: any) => { setFormData({ ...p }); setEditingId(p._id); setIsFormOpen(true); };

  const authHeader = () => { const t = localStorage.getItem('token'); return t ? { Authorization: `Bearer ${t}` } : {}; };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Properties Management</h1>
            <p className="text-gray-600 mt-1">Manage your property listings</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setFormData({ title: '', description: '', price: 0, location: '', propertyType: 'flat', status: 'approved', images: [] }); setEditingId(null); setIsFormOpen(true); }}>
              <Plus className="mr-2" size={16} />
              New Property
            </Button>
          </div>
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Property' : 'New Property'}</CardTitle>
              <CardDescription>Fill details and save</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              <Input placeholder="Price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
              <Input placeholder="Type (flat/plot/commercial/rental)" value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} />
              <textarea className="w-full border rounded p-2" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
                <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditingId(null); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Properties</CardTitle>
            <CardDescription>Approved listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {properties.map((p) => (
                <div key={p._id} className="border rounded p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-sm text-gray-600">{p.location}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(p)}><Edit size={16} /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(p._id)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
