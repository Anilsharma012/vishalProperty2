import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Maximize, IndianRupee, ArrowLeft, MessageCircle, Phone } from 'lucide-react';
import api from '@/lib/api';

interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  area?: number;
  area_unit?: string;
  propertyType?: string;
  status?: string;
  images?: string[];
  sector?: string;
}

const CityProperties = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProperties(); }, [city]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/properties');
      let items: Property[] = data.items || [];
      if (city && city !== 'all') {
        const c = city.toLowerCase();
        items = items.filter(p => (p.location || '').toLowerCase().includes(c));
      }
      setProperties(items);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(0)} Lakhs`;
  };

  const handleWhatsAppEnquiry = (propertyTitle: string) => {
    const message = encodeURIComponent(`Hi Vishal Properties, I'm interested in ${propertyTitle}`);
    window.open(`https://wa.me/919592077999?text=${message}`, '_blank');
  };

  const handleCallNow = () => { window.open('tel:9592077999', '_self'); };

  const getCityTitle = () => { if (!city || city === 'all') return 'All Cities'; return city.charAt(0).toUpperCase() + city.slice(1); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Properties in {getCityTitle()}</h1>
          <p className="text-muted-foreground">Browse properties available in {city === 'all' ? 'all cities' : getCityTitle()}</p>
        </div>
        {loading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Loading properties...</p></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12"><p className="text-muted-foreground">No properties found in this city</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Card key={property._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 overflow-hidden group">
                  <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-4 right-4"><span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">Available</span></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  {property.sector && (<p className="text-sm text-muted-foreground mb-4">Sector {property.sector}</p>)}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {property.area && (<div className="flex items-center gap-2"><Maximize className="h-4 w-4 text-primary" /><span className="text-sm">{property.area} {property.area_unit}</span></div>)}
                    <div className="flex items-center gap-2"><Home className="h-4 w-4 text-primary" /><span className="text-sm capitalize">{property.propertyType}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t mb-4">
                    <div className="flex items-center gap-1"><IndianRupee className="h-5 w-5 text-secondary" /><span className="text-2xl font-bold text-secondary">{formatPrice(property.price)}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => handleWhatsAppEnquiry(property.title)} size="sm" className="bg-green-600 hover:bg-green-700 gap-2"><MessageCircle className="h-4 w-4" />WhatsApp</Button>
                    <Button onClick={handleCallNow} size="sm" variant="outline" className="gap-2"><Phone className="h-4 w-4" />Call Now</Button>
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

export default CityProperties;
