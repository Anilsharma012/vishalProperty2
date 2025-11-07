import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { demoProperties } from '@/data/demoProperties';
import { UploadGallery } from '@/components/UploadGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, Database } from 'lucide-react';
import type { Property } from '@/types';

export default function AdminProperties() {
  const navigate = useNavigate();
  const { user, isLoading } = useSupabaseAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Property>({
    title: '',
    description: '',
    price: 0,
    city: '',
    location: '',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    type: 'Apartment',
    status: 'active',
    images: [],
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      setIsLoadingProperties(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load properties');
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const generateSlug = (title: string) => {
    let slug = slugify(title);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${slug}-${randomSuffix}`;
  };

  const handleSave = async () => {
    if (!formData.title || !formData.price || !formData.city || !formData.type) {
      toast.error('Please fill in required fields: title, price, city, type');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        slug: editingId ? undefined : generateSlug(formData.title),
        images: formData.images,
      };

      if (editingId) {
        const { error } = await supabase
          .from('properties')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Property updated successfully');
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Property created successfully');
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        price: 0,
        city: '',
        location: '',
        area: 0,
        bedrooms: 0,
        bathrooms: 0,
        type: 'Apartment',
        status: 'active',
        images: [],
      });
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      toast.success('Property deleted successfully');
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete property');
    }
  };

  const handleEdit = (property: Property) => {
    setFormData(property);
    setEditingId(property.id || null);
    setIsFormOpen(true);
  };

  const handleSeedData = async () => {
    try {
      const count = properties.length;
      if (count > 0) {
        if (!confirm(`You already have ${count} properties. Continue seeding?`)) {
          return;
        }
      }

      const { error } = await supabase.from('properties').insert(
        demoProperties.map(prop => ({
          ...prop,
          slug: generateSlug(prop.title),
        }))
      );

      if (error) {
        if (error.message.includes('is_admin')) {
          toast.error('Admin claim required. Please check your JWT token.');
        } else {
          throw error;
        }
      } else {
        toast.success('Demo data seeded successfully');
        loadProperties();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to seed data');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Properties Management</h1>
            <p className="text-gray-600 mt-1">Manage your property listings</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSeedData} variant="outline">
              <Database className="mr-2" size={16} />
              Seed Demo Data
            </Button>
            <Button onClick={() => { setFormData({
              title: '',
              description: '',
              price: 0,
              city: '',
              location: '',
              area: 0,
              bedrooms: 0,
              bathrooms: 0,
              type: 'Apartment',
              status: 'active',
              images: [],
            }); setEditingId(null); setIsFormOpen(true); }}>
              <Plus className="mr-2" size={16} />
              New Property
            </Button>
          </div>
        </div>

        {/* Form Dialog */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit' : 'Create'} Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Price *"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
                <Input
                  placeholder="City *"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Area (sq ft)"
                  value={formData.area || ''}
                  onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Bedrooms"
                  value={formData.bedrooms || ''}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Bathrooms"
                  value={formData.bathrooms || ''}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                />
                <select
                  className="border rounded px-3 py-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Rent">Rent</option>
                </select>
                <select
                  className="border rounded px-3 py-2"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2 mt-1"
                  rows={3}
                  placeholder="Property description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <UploadGallery
                slug={formData.title ? generateSlug(formData.title) : 'property'}
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
              />

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => setIsFormOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Table */}
        {isLoadingProperties ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No properties yet. Create one or seed demo data.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Properties ({properties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">City</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr key={prop.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{prop.title}</td>
                        <td className="py-3 px-4">{prop.city}</td>
                        <td className="py-3 px-4">₹{prop.price?.toLocaleString()}</td>
                        <td className="py-3 px-4">{prop.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prop.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : prop.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {prop.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 space-x-2">
                          <button
                            onClick={() => handleEdit(prop)}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            <Edit size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(prop.id || '')}
                            className="text-red-600 hover:underline text-xs"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
