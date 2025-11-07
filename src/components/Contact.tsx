import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MessageCircle, MapPin, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(15),
  email: z.string().trim().email("Invalid email address").max(255).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      // Send to WhatsApp and stay on same page
      const whatsappMessage = encodeURIComponent(
        `🏠 New Property Enquiry\n\n👤 Name: ${validated.name}\n📞 Phone: ${validated.phone}\n📧 Email: ${validated.email || 'Not provided'}\n💬 Message:\n${validated.message}`
      );
      window.open(`https://wa.me/919592077999?text=${whatsappMessage}`, "_blank");
      
      toast.success("Thank you! Redirecting to WhatsApp...");
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to send enquiry. Please try again.");
      }
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919592077999?text=Hi, I want to inquire about properties", "_blank");
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions? We're here to help you find your perfect property
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Phone Numbers</h4>
                    <a href="tel:9592077999" className="block text-muted-foreground hover:text-primary transition-colors">
                      Virender Narwal: +91 9592077999
                    </a>
                    <a href="tel:9991810000" className="block text-muted-foreground hover:text-primary transition-colors">
                      Sukhvir Narwal: +91 9991810000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Quick Contact</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button onClick={handleWhatsApp} size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button onClick={() => window.open('tel:9592077999', '_self')} size="sm" variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Visit Our Office</h4>
                    <p className="text-sm text-muted-foreground">
                      Shop No. 12, Suncity Heights<br />
                      Sector 36, Rohtak – 124001, Haryana
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Alternate: 59, Sector 3, Rohtak – 124001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-xl">
              <h4 className="font-semibold mb-2">Working Hours</h4>
              <p className="text-sm text-muted-foreground">Monday - Saturday</p>
              <p className="text-lg font-bold text-primary">10:00 AM - 7:00 PM</p>
            </div>

            <div className="bg-gradient-to-br from-secondary/10 to-accent/10 p-6 rounded-xl">
              <h4 className="font-semibold mb-3">Have a property to sell?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your property details and our team will contact you
              </p>
              <Button 
                onClick={() => navigate('/dashboard/post')}
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                Submit Property
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-xl shadow-lg border">
            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
