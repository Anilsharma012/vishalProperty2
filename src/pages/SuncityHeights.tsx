import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import PropertyFilters, { PropertyFilterValues } from "@/components/PropertyFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Square, Download } from "lucide-react";
import suncityHero from "@/assets/suncity-exterior.jpg";
import api from '@/lib/api';

interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
  area?: number;
  property_type?: string;
  propertyType?: string;
  status?: string;
  images?: string[] | null;
  map_link?: string | null;
  brochure_url?: string | null;
}

const SuncityHeights = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await api.get('/properties');
      const items: Property[] = (data.items || []).filter((p: any) => (p.location || '').toLowerCase().includes('suncity'));
      setProperties(items);
      setFilteredProperties(items);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: PropertyFilterValues) => {
    let filtered = [...properties];
    if (filters.type && filters.type !== "all") filtered = filtered.filter((p: any) => (p.propertyType || p.property_type) === filters.type);
    if (filters.location) filtered = filtered.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.minPrice) filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice) * 100000);
    if (filters.maxPrice) filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice) * 100000);
    if (filters.minArea) filtered = filtered.filter((p: any) => (p.area || 0) >= parseFloat(filters.minArea));
    if (filters.maxArea) filtered = filtered.filter((p: any) => (p.area || 0) <= parseFloat(filters.maxArea));
    setFilteredProperties(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-6">
            <img src={suncityHero} alt="Suncity Heights" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-bold mb-2">Suncity Heights</h1>
              <p className="text-white/90">Premium properties in Suncity area</p>
            </div>
          </div>
        </div>

        <PropertyFilters onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading properties...</p></div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12"><p className="text-muted-foreground">No properties found in Suncity Heights</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Card key={property._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 overflow-hidden group">
                  <img src={property.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-4 right-4"><span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">Available</span></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-2"><MapPin className="h-4 w-4 mr-1 flex-shrink-0" /><span className="text-sm">{property.location}</span></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {property.area && (<div className="flex items-center gap-2"><Square className="h-4 w-4 text-primary" /><span className="text-sm">{property.area} sq ft</span></div>)}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t mb-4">
                    <div className="flex items-center gap-1"><span className="text-2xl font-bold text-secondary">₹{(property.price || 0).toLocaleString()}</span></div>
                    {property.brochure_url && (<a href={property.brochure_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm flex items-center gap-1">Brochure <Download size={14} /></a>)}
                  </div>
                  <div className="grid grid-cols-2 gap-2"><Button size="sm" className="bg-green-600 hover:bg-green-700">WhatsApp</Button><Button size="sm" variant="outline">Call Now</Button></div>
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

export default SuncityHeights;
