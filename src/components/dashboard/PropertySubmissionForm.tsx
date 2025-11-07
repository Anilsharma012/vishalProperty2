import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import api from '@/lib/api';

const propertySchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(2000),
  property_type: z.enum(["flat", "plot", "commercial", "rental"]),
  location: z.string().trim().min(3, "Location is required").max(200),
  area: z.string().optional(),
  price: z.string().optional(),
});

const PropertySubmissionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", property_type: "flat", location: "", area: "", price: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validated = propertySchema.parse(formData);
      await api.post('/enquiries', {
        name: validated.title,
        phone: 'N/A',
        email: undefined,
        message: `Property submission request\nType: ${validated.property_type}\nLocation: ${validated.location}\nArea: ${validated.area || '-'}\nPrice: ${validated.price || '-' }\n\n${validated.description}`,
      });
      toast.success("Submitted! Our team will contact you.");
      setFormData({ title: "", description: "", property_type: "flat", location: "", area: "", price: "" });
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit property. Please try again.");
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
          <Input placeholder="e.g., 3 BHK Luxury Flat in Sector 36" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea placeholder="Detailed description of your property..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} required />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Property Type</label>
            <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Input placeholder="e.g., Suncity Heights" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Area (optional)</label>
            <Input placeholder="e.g., 1200" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Price (optional)</label>
            <Input placeholder="e.g., 4500000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
      </form>
    </Card>
  );
};

export default PropertySubmissionForm;
