import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PropertyFilters, { PropertyFilterValues } from "@/components/PropertyFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Maximize, IndianRupee, ArrowLeft, ExternalLink } from "lucide-react";
import api from '@/lib/api';

interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
  area?: number;
  area_unit?: string;
  propertyType?: string;
  status?: string;
  images?: string[];
  map_link?: string;
}

const PropertyCategory = () => {
  const { category } = useParams<{ category: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProperties(); }, [category]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/properties');
      let items: Property[] = data.items || [];
      if (category && category !== 'all') {
        const typeMap: Record<string, string> = { flat: 'flat', plot: 'plot', commercial: 'commercial', rental: 'rental', agricultural: 'flat', clu: 'plot' };
        const desired = typeMap[category] || category;
        items = items.filter(p => (p as any).propertyType === desired || (p as any).property_type === desired);
      }
      setProperties(items);
      setFilteredProperties(items);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: PropertyFilterValues) => {
    let filtered = [...properties];
    if (filters.type !== 'all') filtered = filtered.filter((p: any) => (p.propertyType || p.property_type) === filters.type);
    if (filters.location) filtered = filtered.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.minPrice) filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice) * 100000);
    if (filters.maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice) * 100000);
    if (filters.minArea) filtered = filtered.filter((p: any) => (p.area || 0) >= parseFloat(filters.minArea));
    if (filters.maxArea) filtered = filtered.filter((p: any) => (p.area || 0) <= parseFloat(filters.maxArea));
    setFilteredProperties(filtered);
  };

  const formatPrice = (price: number) => price >= 10000000 ? `₹${(price / 10000000).toFixed(2)} Cr` : `₹${(price / 100000).toFixed(0)} Lakhs`;

  const getCategoryTitle = () => { if (!category || category === 'all') return 'All Properties'; return category.charAt(0).toUpperCase() + category.slice(1) + 's'; };

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
          <p className="text-muted-foreground">Browse our {category === 'all' ? '' : category} properties in Rohtak</p>
        </div>

        <PropertyFilters onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading properties...</p></div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12"><p className="text-muted-foreground">No properties found matching your criteria</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Card key={property._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 overflow-hidden group">
                  <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-2"><MapPin className="h-4 w-4 mr-1 flex-shrink-0" /><span className="text-sm">{property.location}</span></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {property.area && (<div className="flex items-center gap-2"><Maximize className="h-4 w-4 text-primary" /><span className="text-sm">{property.area} {property.area_unit}</span></div>)}
                    <div className="flex items-center gap-2"><Home className="h-4 w-4 text-primary" /><span className="text-sm capitalize">{property.propertyType}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t mb-4">
                    <div className="flex items-center gap-1"><IndianRupee className="h-5 w-5 text-secondary" /><span className="text-2xl font-bold text-secondary">{formatPrice(property.price)}</span></div>
                    {property.map_link && (<a href={property.map_link} target="_blank" rel="noreferrer" className="text-blue-600 text-sm flex items-center gap-1">View on Map <ExternalLink size={14} /></a>)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => handleWhatsAppEnquiry(property.title)} size="sm" className="bg-green-600 hover:bg-green-700">WhatsApp</Button>
                    <Button size="sm" variant="outline">Call Now</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
};

export default PropertyCategory;
