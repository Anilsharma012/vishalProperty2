import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PropertyFilters, { PropertyFilterValues } from "@/components/PropertyFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Maximize, IndianRupee, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  area_unit: string;
  property_type: string;
  status: string;
  images: string[];
  map_link?: string;
}

const PropertyCategory = () => {
  const { category } = useParams<{ category: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, [category]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("status", "available");

      if (category && category !== "all") {
        // Map category to database property_type
        const typeMapping: Record<string, 'flat' | 'plot' | 'commercial' | 'rental'> = {
          'flat': 'flat',
          'plot': 'plot',
          'commercial': 'commercial',
          'rental': 'rental',
          'agricultural': 'flat', // Map to flat if not directly supported
          'clu': 'plot'  // Map to plot if not directly supported
        };
        
        const dbType = typeMapping[category] || 'flat';
        query = query.eq("property_type", dbType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: PropertyFilterValues) => {
    let filtered = [...properties];

    if (filters.type !== "all") {
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
    return `₹${(price / 100000).toFixed(0)} Lakhs`;
  };

  const getCategoryTitle = () => {
    if (!category || category === "all") return "All Properties";
    return category.charAt(0).toUpperCase() + category.slice(1) + "s";
  };

  const handleWhatsAppEnquiry = (propertyTitle: string) => {
    const message = encodeURIComponent(`Hi Vishal Properties, I'm interested in ${propertyTitle}`);
    window.open(`https://wa.me/919592077899?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link to="/#properties">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Properties
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{getCategoryTitle()}</h1>
          <p className="text-muted-foreground">
            Browse our {category === "all" ? "" : category} properties in Rohtak
          </p>
        </div>

        <PropertyFilters onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 overflow-hidden group">
                  <img 
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"} 
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {property.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Maximize className="h-4 w-4 text-primary" />
                      <span className="text-sm">{property.area} {property.area_unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="text-sm capitalize">{property.property_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-5 w-5 text-secondary" />
                      <span className="text-2xl font-bold text-secondary">{formatPrice(property.price)}</span>
                    </div>
                    <div className="flex gap-2">
                      {property.map_link && (
                        <Button 
                          onClick={() => window.open(property.map_link, "_blank")}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleWhatsAppEnquiry(property.title)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Enquire
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link to={`/property/${property.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default PropertyCategory;
