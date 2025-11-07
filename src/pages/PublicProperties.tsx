import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Share2 } from 'lucide-react';
import type { Property } from '@/types';
import api from '@/lib/api';

const ITEMS_PER_PAGE = 12;
const CITIES = ['All', 'Rohtak'];
const TYPES = ['All', 'Apartment', 'House', 'Plot', 'Commercial', 'Rent'];

export default function PublicProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    city: 'All',
    type: 'All',
    priceMin: 0,
    priceMax: 1000000000,
    search: '',
  });

  useEffect(() => { loadProperties(); }, []);
  useEffect(() => { applyFilters(); }, [properties, filters]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/properties');
      setProperties(data.items || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = properties;
    if (filters.city !== 'All') filtered = filtered.filter((p: any) => (p.city || p.location || '').toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.type !== 'All') filtered = filtered.filter((p: any) => (p.propertyType || p.type) === filters.type);
    filtered = filtered.filter((p: any) => (p.price || 0) >= filters.priceMin && (p.price || 0) <= filters.priceMax);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((p: any) => (p.title || '').toLowerCase().includes(s) || (p.location || '').toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s));
    }
    setFilteredProperties(filtered as any);
    setCurrentPage(1);
  };

  const paginatedProperties = filteredProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  const handleShare = (property: Property) => {
    if (navigator.share) navigator.share({ title: property.title, text: property.description, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-gray-600 mt-2">Browse available properties in Rohtak</p>
        </div>
      </div>
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          <div className="grid md:grid-cols-5 gap-3">
            <Input placeholder="Search by title, location..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <select className="border rounded px-3 py-2" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
              {CITIES.map(city => (<option key={city} value={city}>{city}</option>))}
            </select>
            <select className="border rounded px-3 py-2" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              {TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
            <Input type="number" placeholder="Min Price" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: parseInt(e.target.value) || 0 })} />
            <Input type="number" placeholder="Max Price" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: parseInt(e.target.value) || 1000000000 })} />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12"><p className="text-gray-600">Loading properties...</p></div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-600">No properties found matching your criteria.</p></div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">Showing {paginatedProperties.length} of {filteredProperties.length} properties</p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {paginatedProperties.map((property: any) => (
                <Card key={property._id || property.id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="relative h-64 bg-gray-200 overflow-hidden group">
                    <img src={property.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${property.type === 'Rent' ? 'bg-green-600' : property.type === 'Commercial' ? 'bg-purple-600' : 'bg-blue-600'}`}>{property.type || property.propertyType}</span>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <Link to={`/property/${property.slug}`} className="block"><h3 className="font-bold text-lg hover:text-blue-600 line-clamp-2">{property.title}</h3></Link>
                    <p className="text-sm text-gray-600">📍 {property.location || property.city}</p>
                    {(property.bedrooms || property.area) && (
                      <div className="flex gap-4 text-sm text-gray-600">
                        {property.bedrooms && (<span>🛏️ {property.bedrooms} BHK</span>)}
                        {property.area && (<span>📐 {property.area} sq ft</span>)}
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <p className="text-2xl font-bold text-green-600">{property.type === 'Rent' ? `₹${(property.price || 0).toLocaleString()}/mo` : `₹${(property.price || 0).toLocaleString()}`}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(`tel:9876543210`, 'tel')} className="gap-1"><Phone size={14} />Call</Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/919876543210?text=Interested%20in%20${property.title}`, 'blank')} className="gap-1"><MessageCircle size={14} />Chat</Button>
                      <Button size="sm" variant="outline" onClick={() => handleShare(property)} className="gap-1"><Share2 size={14} />Share</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button key={page} variant={currentPage === page ? 'default' : 'outline'} onClick={() => setCurrentPage(page)} size="sm">{page}</Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
