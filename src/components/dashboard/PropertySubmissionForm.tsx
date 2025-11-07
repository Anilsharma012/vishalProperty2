import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
  propertyType: z.enum(["Apartment", "House", "Plot", "Commercial", "Rent"]),
  location: z.string().trim().min(3, "Location is required").max(200),
  area: z.number().positive("Area must be positive"),
  price: z.number().positive("Price must be positive"),
  ownerContact: z.string().min(10, "Valid phone number required"),
});

const PropertySubmissionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "Apartment",
    location: "",
    area: "",
    price: "",
    ownerContact: "",
    images: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = propertySchema.parse({
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        location: formData.location,
        area: parseFloat(formData.area),
        price: parseFloat(formData.price),
        ownerContact: formData.ownerContact,
      });

      const slug = validated.title.toLowerCase().replace(/\s+/g, '-');

      await api.createProperty({
        title: validated.title,
        slug: slug,
        description: validated.description,
        propertyType: validated.propertyType,
        location: validated.location,
        area: validated.area,
        price: validated.price,
        ownerContact: validated.ownerContact,
        status: "draft",
        images: formData.images,
        features: [],
      });

      toast.success("Property submitted successfully! Awaiting admin approval.");
      setFormData({
        title: "",
        description: "",
        propertyType: "Apartment",
        location: "",
        area: "",
        price: "",
        ownerContact: "",
        images: [],
      });
    } catch (error: any) {
      let errorMsg = "Failed to submit property. Please try again.";
      if (error instanceof z.ZodError) {
        errorMsg = error.errors[0]?.message || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Submit Your Property</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Property Title</label>
          <Input
            placeholder="e.g., 3 BHK Luxury Flat in Sector 36"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            placeholder="Detailed description of your property..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Property Type</label>
            <Select
              value={formData.propertyType}
              onValueChange={(value) => setFormData({ ...formData, propertyType: value as any })}
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

          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Input
              placeholder="e.g., Suncity Heights"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Price (₹)</label>
            <Input
              type="number"
              placeholder="e.g., 8500000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Area (sq ft)</label>
            <Input
              type="number"
              placeholder="e.g., 1500"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Contact Number</label>
          <Input
            placeholder="e.g., 9876543210"
            value={formData.ownerContact}
            onChange={(e) => setFormData({ ...formData, ownerContact: e.target.value })}
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Property for Approval"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Your property will be reviewed by our admin team before being published.
        </p>
      </form>
    </Card>
  );
};

export default PropertySubmissionForm;
