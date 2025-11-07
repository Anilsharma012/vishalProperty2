import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Maximize, IndianRupee, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InquiryDialog from "./InquiryDialog";
import { supabase } from "@/integrations/supabase/client";
import { demoProperties } from "@/data/demoProperties";

import buildingImg from "@/assets/building-exterior.jpg";
import interiorImg from "@/assets/flat-interior.jpg";
import rohtakGateImg from "@/assets/rohtak-gate.jpg";
import suncityBuildingImg from "@/assets/suncity-building.jpg";

interface Property {
  id?: string;
  title: string;
  price: number;
  location: string;
  area: number;
  area_unit?: string;
  property_type?: string;
  type?: string;
  status: string;
  images: string[];
  map_link?: string;
}

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [displayProperties, setDisplayProperties] = useState<Property[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fallbackProperties = [
    {
      id: "1",
      title: "3 BHK Luxury Flat",
      price: 8500000,
      location: "Sector 36, Rohtak",
      area: 1500,
      area_unit: "sq ft",
      property_type: "flat",
      status: "available",
      images: [buildingImg],
      map_link: ""
    },
    {
      id: "2",
      title: "Residential Plot",
      price: 4500000,
      location: "Suncity Heights",
      area: 200,
      area_unit: "sq yd",
      property_type: "plot",
      status: "available",
      images: [rohtakGateImg],
      map_link: ""
    },
    {
      id: "3",
      title: "Commercial Space",
      price: 12000000,
      location: "Sector 3, Rohtak",
      area: 2500,
      area_unit: "sq ft",
      property_type: "commercial",
      status: "available",
      images: [suncityBuildingImg],
      map_link: ""
    },
    {
      id: "4",
      title: "2 BHK Apartment",
      price: 5500000,
      location: "Suncity Projects",
      area: 1100,
      area_unit: "sq ft",
      property_type: "flat",
      status: "available",
      images: [interiorImg],
      map_link: ""
    }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "available")
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedProperties: Property[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          location: item.location,
          area: item.area,
          area_unit: "sq ft",
          property_type: item.type || "flat",
          type: item.type || "flat",
          status: "available",
          images: item.images || [],
          map_link: item.map_link || "",
        }));
        setProperties(formattedProperties);
        setDisplayProperties(formattedProperties);
      } else {
        setProperties(fallbackProperties);
        setDisplayProperties(fallbackProperties);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "Unknown error";
      console.error("Error fetching properties:", errorMessage, error);
      setProperties(fallbackProperties);
      setDisplayProperties(fallbackProperties);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      setDisplayProperties(properties);
    } else {
      navigate(`/properties/${category}`);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(0)} Lakhs`;
  };

  const handleWhatsAppEnquiry = (propertyTitle: string) => {
    const message = encodeURIComponent(`Hi Vishal Properties, I'm interested in ${propertyTitle}`);
    window.open(`https://wa.me/919592077899?text=${message}`, "_blank");
  };

  return (
    <section id="properties" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our handpicked selection of premium properties in Rohtak
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="w-full max-w-xs">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="flat">Flats</SelectItem>
                <SelectItem value="plot">Plots</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 overflow-hidden group">
                  <img
                    src={property.images && property.images.length > 0 ? property.images[0] : buildingImg}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Available
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
                      <span className="text-sm">{property.area} {property.area_unit || "sq ft"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="text-sm capitalize">{property.property_type || property.type || "flat"}</span>
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

        <div className="text-center mt-12 flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/properties/all')}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            View All Properties
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => setInquiryOpen(true)}
          >
            Quick Inquiry
          </Button>
        </div>
      </div>
      
      <InquiryDialog open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </section>
  );
};

export default Properties;
