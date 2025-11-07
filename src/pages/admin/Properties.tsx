import { useState, useEffect } from "react";
import { Edit2, Trash2, Eye, Star, Upload, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Property } from "@/types";

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  location: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  type: string;
  status: string;
  images: string[];
  imageFiles: File[];
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: "",
    location: "",
    area: "",
    bedrooms: "0",
    bathrooms: "0",
    type: "Apartment",
    status: "available",
    images: [],
    imageFiles: [],
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
        throw new Error("Supabase environment variables not configured");
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        throw new Error(errorMsg);
      }

      const formattedProperties: Property[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        location: item.location,
        area: item.area,
        bedrooms: item.bedrooms || 0,
        bathrooms: item.bathrooms || 0,
        type: item.type || "Apartment",
        status: item.status,
        images: item.images || [],
        created_at: item.created_at,
      }));

      setProperties(formattedProperties);
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "Unknown error";
      console.error("Error details:", errorMsg, error);
      toast.error("Failed to fetch properties: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      location: "",
      area: "",
      bedrooms: "0",
      bathrooms: "0",
      type: "Apartment",
      status: "available",
      images: [],
      imageFiles: [],
    });
    setOpenForm(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({
      ...formData,
      imageFiles: [...formData.imageFiles, ...files],
    });
  };

  const removeImageFile = (index: number) => {
    setFormData({
      ...formData,
      imageFiles: formData.imageFiles.filter((_, i) => i !== index),
    });
  };

  const removeImageUrl = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [...formData.images];

    for (const file of formData.imageFiles) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `properties/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, file);

        if (uploadError) {
          const errorMsg = uploadError.message || JSON.stringify(uploadError);
          throw new Error(errorMsg);
        }

        const { data } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      } catch (error: any) {
        toast.error(`Failed to upload image: ${error.message}`);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const handleSaveProperty = async () => {
    if (!formData.title || !formData.price || !formData.location || !formData.area) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      let imageUrls: string[] = [];

      if (formData.imageFiles.length > 0) {
        imageUrls = await uploadImages();
      } else if (formData.images.length === 0) {
        toast.error("Please add at least one image");
        setUploading(false);
        return;
      } else {
        imageUrls = formData.images;
      }

      const propertyType: 'flat' | 'plot' | 'commercial' | 'rental' = 
        (formData.type === 'Apartment' || formData.type === 'House') ? 'flat' : 
        formData.type === 'Plot' ? 'plot' : 
        formData.type === 'Commercial' ? 'commercial' : 
        'rental';
      
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        location: formData.location,
        area: parseInt(formData.area),
        property_type: propertyType,
        status: formData.status as 'available' | 'pending' | 'sold',
        images: imageUrls,
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("properties")
          .insert([propertyData]);
        error = insertError;
      }

      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        throw new Error(errorMsg);
      }

      toast.success(editingId ? "Property updated!" : "Property added!");
      setOpenForm(false);
      fetchProperties();
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "Unknown error";
      console.error("Error details:", errorMsg, error);
      toast.error(errorMsg || "Failed to save property");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        throw new Error(errorMsg);
      }

      toast.success("Property deleted!");
      fetchProperties();
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || "Unknown error";
      console.error("Error details:", errorMsg, error);
      toast.error(errorMsg || "Failed to delete property");
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return "₹0";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-muted-foreground mt-1">Manage all property listings</p>
          </div>
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button onClick={handleAddProperty}>+ Add Property</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Property" : "Add New Property"}
                </DialogTitle>
                <DialogDescription>
                  Fill in all required details to list a property
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <Label>Property Title *</Label>
                  <Input
                    placeholder="e.g., 3 BHK Luxury Flat"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the property..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="h-20"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 6500000"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <Input
                      placeholder="e.g., Sector 3, Rohtak"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Area (sq ft) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1650"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Property Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Bedrooms</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bedrooms: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bathrooms: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) =>
                        setFormData({ ...formData, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Images *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Click to upload images
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </label>
                  </div>

                  {/* Selected Images Preview */}
                  {formData.imageFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        New Images ({formData.imageFiles.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.imageFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative bg-gray-100 rounded aspect-square flex items-center justify-center"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Images */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Existing Images ({formData.images.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.images.map((url, index) => (
                          <div
                            key={index}
                            className="relative bg-gray-100 rounded aspect-square"
                          >
                            <img
                              src={url}
                              alt="existing"
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenForm(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProperty} disabled={uploading}>
                  {uploading ? "Uploading..." : "Save Property"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block">Search</Label>
                <Input
                  placeholder="Search title, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Properties ({filteredProperties.length})</CardTitle>
            <CardDescription>
              Total: {properties.length} | Selected: {selectedProperties.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading properties...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedProperties.length ===
                              filteredProperties.length &&
                            filteredProperties.length > 0
                          }
                          onChange={(checked) => {
                            if (checked) {
                              setSelectedProperties(
                                filteredProperties.map((p) => p.id || "")
                              );
                            } else {
                              setSelectedProperties([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No properties found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProperties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedProperties.includes(
                                property.id || ""
                              )}
                              onChange={(checked) => {
                                if (checked) {
                                  setSelectedProperties([
                                    ...selectedProperties,
                                    property.id || "",
                                  ]);
                                } else {
                                  setSelectedProperties(
                                    selectedProperties.filter(
                                      (id) => id !== property.id
                                    )
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {property.title}
                          </TableCell>
                          <TableCell className="text-sm">
                            {property.location}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(property.price)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {property.area} sq ft
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(property.status || "")}>
                              {property.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {(property.images || []).length} image
                            {(property.images || []).length !== 1 ? "s" : ""}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete"
                                onClick={() =>
                                  handleDeleteProperty(property.id || "")
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Properties;
