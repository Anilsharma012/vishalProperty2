import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Properties from "@/components/Properties";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import LiveChat from "@/components/LiveChat";
import InquiryDialog from "@/components/InquiryDialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Building2, Sprout, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showInquiry, setShowInquiry] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show inquiry popup after 10 seconds
    const timer = setTimeout(() => {
      setShowInquiry(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const categories = [
    {
      title: "Residential Flats",
      description: "Modern apartments in prime locations",
      icon: Home,
      path: "/properties/flat",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Commercial Properties",
      description: "Shops, offices and commercial spaces",
      icon: Building2,
      path: "/properties/commercial",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Agricultural Land",
      description: "Fertile land for farming",
      icon: Sprout,
      path: "/properties/agricultural",
      color: "from-green-500 to-green-600"
    },
    {
      title: "CLU Properties",
      description: "Change of Land Use approved plots",
      icon: FileText,
      path: "/properties/clu",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Property Categories Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Browse by Category</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4" />
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find the perfect property type that suits your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {categories.map((category) => (
                <Card
                  key={category.path}
                  className="p-6 hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => navigate(category.path)}
                >
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <Button variant="link" className="p-0 h-auto">
                    View Properties →
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* City-wise Properties Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Properties by City</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4" />
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover properties in key cities and locations
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {["Rohtak", "Gurgaon", "Delhi", "Sonipat"].map((city) => (
                <Card
                  key={city}
                  className="p-6 hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-background to-muted/20"
                  onClick={() => navigate(`/city/${city.toLowerCase()}`)}
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{city}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View all properties in {city}
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Browse Properties →
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <About />
        <Properties />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
      <LiveChat />
      <InquiryDialog open={showInquiry} onOpenChange={setShowInquiry} />
    </div>
  );
};

export default Index;
