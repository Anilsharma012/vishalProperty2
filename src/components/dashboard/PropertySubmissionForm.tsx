import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const propertySchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
  property_type: z.enum(["flat", "plot", "commercial", "rental"]),
  location: z.string().trim().min(3, "Location is required").max(200),
  sector: z.string().trim().max(100).optional(),
  area: z.number().positive("Area must be positive"),
  area_unit: z.string().min(1, "Area unit is required"),
  price: z.number().positive("Price must be positive"),
  features: z.array(z.string()).optional(),
  map_link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const PropertySubmissionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "flat",
    location: "",
    sector: "",
    area: "",
    area_unit: "sq ft",
    price: "",
    features: "",
    map_link: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to submit a property");
        navigate("/auth");
        return;
      }

      const validated = propertySchema.parse({
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        location: formData.location,
        sector: formData.sector || null,
        area: parseFloat(formData.area),
        area_unit: formData.area_unit,
        price: parseFloat(formData.price),
        features: formData.features ? formData.features.split(",").map(f => f.trim()) : [],
        map_link: formData.map_link || null,
      });

      const { error } = await supabase
        .from("property_submissions")
        .insert({
          user_id: user.id,
          title: validated.title,
          description: validated.description,
          property_type: validated.property_type,
          location: validated.location,
          sector: validated.sector,
          area: validated.area,
          area_unit: validated.area_unit,
          price: validated.price,
          features: validated.features,
        });

      if (error) throw error;

      toast.success("Property submitted successfully! Awaiting admin approval.");
      setFormData({
        title: "",
        description: "",
        property_type: "flat",
        location: "",
        sector: "",
        area: "",
        area_unit: "sq ft",
        price: "",
        features: "",
        map_link: "",
      });
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit property. Please try again.");
      }
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
              value={formData.property_type}
              onValueChange={(value) => setFormData({ ...formData, property_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
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
            <label className="text-sm font-medium mb-2 block">Sector (Optional)</label>
            <Input
              placeholder="e.g., Sector 36"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            />
          </div>

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
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Area</label>
            <Input
              type="number"
              placeholder="e.g., 1500"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Area Unit</label>
            <Select
              value={formData.area_unit}
              onValueChange={(value) => setFormData({ ...formData, area_unit: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sq ft">Square Feet</SelectItem>
                <SelectItem value="sq yd">Square Yards</SelectItem>
                <SelectItem value="sq m">Square Meters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Features (comma-separated)</label>
          <Input
            placeholder="e.g., Parking, Garden, Gym"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Map Link (Optional)</label>
          <Input
            type="url"
            placeholder="Google Maps link"
            value={formData.map_link}
            onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
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
