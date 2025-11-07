import { useState, useEffect } from "react";
import { Edit2, Trash2, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/services/api";
import { toast } from "sonner";
import type { Property } from "@/types";

interface PropertyFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  location: string;
  city: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  status: string;
  images: string[];
  coverImage: string;
  premium: boolean;
  ownerContact: string;
  features: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    slug: "",
    description: "",
    price: "",
    location: "",
    city: "",
    area: "",
    bedrooms: "0",
    bathrooms: "0",
    propertyType: "Apartment",
    status: "draft",
    images: [],
    coverImage: "",
    premium: false,
    ownerContact: "",
    features: "",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminProperties();
      setProperties(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        city: formData.city,
        area: formData.area ? parseFloat(formData.area) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        propertyType: formData.propertyType,
        status: formData.status,
        images: formData.images,
        coverImage: formData.coverImage,
        premium: formData.premium,
        ownerContact: formData.ownerContact,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : []
      };

      if (editingId) {
        await api.updateProperty(editingId, data);
        toast.success("Property updated successfully");
      } else {
        await api.createProperty(data);
        toast.success("Property created successfully");
      }

      setOpenForm(false);
      setEditingId(null);
      resetForm();
      fetchProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to save property");
    }
  };

  const handleEdit = (property: any) => {
    setFormData({
      title: property.title,
      slug: property.slug,
      description: property.description,
      price: property.price.toString(),
      location: property.location,
      city: property.city || "",
      area: property.area?.toString() || "",
      bedrooms: property.bedrooms?.toString() || "0",
      bathrooms: property.bathrooms?.toString() || "0",
      propertyType: property.propertyType,
      status: property.status,
      images: property.images || [],
      coverImage: property.coverImage || "",
      premium: property.premium || false,
      ownerContact: property.ownerContact,
      features: Array.isArray(property.features) ? property.features.join(', ') : "",
    });
    setEditingId(property._id);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await api.deleteProperty(id);
        toast.success("Property deleted successfully");
        fetchProperties();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete property");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      price: "",
      location: "",
      city: "",
      area: "",
      bedrooms: "0",
      bathrooms: "0",
      propertyType: "Apartment",
      status: "draft",
      images: [],
      coverImage: "",
      premium: false,
      ownerContact: "",
      features: "",
    });
    setEditingId(null);
  };

  const filteredProperties = properties.filter((property) => {
    const matchesStatus = filterStatus === "all" || property.status === filterStatus;
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-gray-500">Manage your property listings</p>
          </div>
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>Add New Property</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Property" : "Add New Property"}</DialogTitle>
                <DialogDescription>
                  Fill in the property details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated from title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Property Type *</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Plot">Plot</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Rent">Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location *</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Area (sq ft)</Label>
                    <Input
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bedrooms</Label>
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Owner Contact *</Label>
                    <Input
                      value={formData.ownerContact}
                      onChange={(e) => setFormData({ ...formData, ownerContact: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Features (comma separated)</Label>
                  <Input
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="e.g., Swimming Pool, Gym, Security"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? "Update Property" : "Create Property"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Loading properties...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Properties List</CardTitle>
              <CardDescription>
                Total: {filteredProperties.length} properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredProperties.length === 0 ? (
                <p className="text-center text-gray-500">No properties found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property: any) => (
                        <TableRow key={property._id}>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>₹{property.price.toLocaleString()}</TableCell>
                          <TableCell>{property.propertyType}</TableCell>
                          <TableCell>
                            <Badge variant={property.status === "active" ? "default" : "secondary"}>
                              {property.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(property)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(property._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Properties;
