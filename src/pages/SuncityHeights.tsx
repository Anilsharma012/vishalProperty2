import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PropertyFilters, { PropertyFilterValues } from "@/components/PropertyFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Square, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import suncityHero from "@/assets/suncity-exterior.jpg";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  property_type: string;
  status: string;
  images: string[] | null;
  map_link: string | null;
  brochure_url: string | null;
}

const SuncityHeights = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "available")
        .ilike("location", "%suncity%");

      if (error) throw error;

      if (data) {
        setProperties(data);
        setFilteredProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: PropertyFilterValues) => {
    let filtered = [...properties];

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter(p => p.property_type === filters.type);
    }

    if (filters.location) {
      filtered = filtered.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice) * 100000;
      filtered = filtered.filter(p => p.price >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice) * 100000;
      filtered = filtered.filter(p => p.price <= maxPrice);
    }

    if (filters.minArea) {
      filtered = filtered.filter(p => p.area >= parseFloat(filters.minArea));
    }

    if (filters.maxArea) {
      filtered = filtered.filter(p => p.area <= parseFloat(filters.maxArea));
    }

    setFilteredProperties(filtered);
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const handleWhatsAppEnquiry = (property: Property) => {
    const message = `Hi, I'm interested in ${property.title} located at ${property.location}. Price: ${formatPrice(property.price)}`;
    const whatsappUrl = `https://wa.me/919592077999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img src={suncityHero} alt="Suncity Heights" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/70"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Suncity Heights</h1>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Hi-Rise Apartments Living - Welcome to a Serene, Smart & Secure Lifestyle
            </p>
            <a href="/brochures/suncity-brochure.pdf" download>
              <Button size="lg" variant="secondary" className="gap-2">
                <Download className="h-5 w-5" />
                Download Brochure
              </Button>
            </a>
          </div>
        </section>

        {/* Properties Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <PropertyFilters onFilterChange={handleFilterChange} />

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No properties found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative h-64">
                      <img
                        src={property.images?.[0] || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                        {property.property_type}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                      <div className="space-y-2 mb-4">
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {property.location}
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Square className="h-4 w-4" />
                          {property.area} sq ft
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-primary mb-4">
                        {formatPrice(property.price)}
                      </p>

                      <div className="flex gap-2">
                        {property.map_link && (
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <a href={property.map_link} target="_blank" rel="noopener noreferrer">
                              <MapPin className="h-4 w-4 mr-1" />
                              Map
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleWhatsAppEnquiry(property)}
                          className="flex-1"
                        >
                          Enquire Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default SuncityHeights;
