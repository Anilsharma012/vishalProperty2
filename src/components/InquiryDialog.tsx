import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(15),
  email: z.string().trim().email("Invalid email address").max(255).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const InquiryDialog = ({ open, onOpenChange }: InquiryDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const validated = enquirySchema.parse(formData);
      
      const { error } = await supabase
        .from("enquiries")
        .insert({
          name: validated.name,
          phone: validated.phone,
          email: validated.email || null,
          message: validated.message,
        });

      if (error) throw error;
      
      const whatsappMessage = encodeURIComponent(
        `New Enquiry:\nName: ${validated.name}\nPhone: ${validated.phone}\nEmail: ${validated.email}\nMessage: ${validated.message}`
      );
      window.open(`https://wa.me/919592077899?text=${whatsappMessage}`, "_blank");
      
      toast.success("Thank you! We'll contact you soon.");
      setFormData({ name: "", phone: "", email: "", message: "" });
      onOpenChange(false);
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to send enquiry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Inquiry</DialogTitle>
          <DialogDescription>
            Fill in your details and we'll get back to you soon
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          <Input
            type="email"
            placeholder="Email Address (optional)"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <Textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows={4}
            required
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Inquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryDialog;
