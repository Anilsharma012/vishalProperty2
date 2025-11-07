import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface PropertyData {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  price: number;
  city?: string;
  location?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  propertyType?: string;
  status?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
}

export default function PropertyDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const propertyIdentifier = id || slug;

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyIdentifier) return;
      try {
        setIsLoading(true);
        const { data } = await api.get(`/properties/${propertyIdentifier}`);
        setProperty(data.item);
      } catch (error) {
        console.error('Failed to load property:', error);
        navigate('/properties/all');
      } finally {
        setIsLoading(false);
      }
    };
    if (propertyIdentifier) loadProperty();
  }, [propertyIdentifier, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Property not found</p>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentImageIndex] : 'https://via.placeholder.com/800x600?text=No+Image';

  const nextImage = () => { if (hasImages) setCurrentImageIndex((prev) => (prev + 1) % images.length); };
  const prevImage = () => { if (hasImages) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: property.title, text: property.description, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/properties')} className="gap-2 mb-4">
            <ChevronLeft size={20} />
            Back to Properties
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gray-200 rounded-lg overflow-hidden h-96 relative group">
          <img src={currentImage} alt={property.title} className="w-full h-full object-cover" />
          {hasImages && images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 opacity-0 group-hover:opacity-100 transition">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 opacity-0 group-hover:opacity-100 transition">
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {hasImages && images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition ${idx === currentImageIndex ? 'border-blue-500' : 'border-gray-300'}`}>
                <img src={img} alt={`${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <p className="text-lg text-gray-600">📍 {property.location || property.city}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-3xl font-bold text-green-600">
                    {(property.propertyType || property.property_type) === 'rental' ? `₹${(property.price || 0).toLocaleString()}/month` : `₹${(property.price || 0).toLocaleString()}`}
                  </p>
                </div>
                {property.description && (
                  <div className="border-t pt-4">
                    <h2 className="font-bold mb-2">Description</h2>
                    <p className="text-gray-700 leading-relaxed">{property.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Button className="w-full" onClick={() => window.open('tel:9876543210', 'tel')}><Phone className="mr-2" size={16} />Call</Button>
            <Button className="w-full" variant="outline" onClick={() => window.open(`https://wa.me/919876543210?text=Interested%20in%20${property.title}`, 'blank')}><MessageCircle className="mr-2" size={16} />Chat</Button>
            <Button className="w-full" variant="outline" onClick={handleShare}><Share2 className="mr-2" size={16} />Share</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
