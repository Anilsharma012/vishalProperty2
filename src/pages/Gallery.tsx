import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

// Import all images
import suncityLawn from "@/assets/suncity-lawn.jpg";
import suncityPathway from "@/assets/suncity-pathway.jpg";
import suncityExterior from "@/assets/suncity-exterior.jpg";
import floorPlan2bhk from "@/assets/floor-plan-2bhk.jpg";
import floorPlan2bhkAlt from "@/assets/floor-plan-2bhk-alt.jpg";
import floorPlan3bhk from "@/assets/floor-plan-3bhk.jpg";
import rohtak from "@/assets/rohtak-entrance.jpg";
import suncityBuilding from "@/assets/suncity-building.jpg";
import officeStorefront from "@/assets/office-storefront.jpg";
import buildingExterior from "@/assets/building-exterior.jpg";
import flatInterior from "@/assets/flat-interior.jpg";
import suncityCourtyard from "@/assets/suncity-courtyard.jpg";
import rohtakGate from "@/assets/rohtak-gate.jpg";

const galleryImages = [
  { id: 1, src: suncityExterior, title: "Suncity Heights - Front View", category: "exterior" },
  { id: 2, src: suncityLawn, title: "Suncity Heights - Lawn Area", category: "exterior" },
  { id: 3, src: suncityPathway, title: "Suncity Heights - Pathway", category: "exterior" },
  { id: 4, src: suncityBuilding, title: "Suncity Heights - Building", category: "exterior" },
  { id: 5, src: suncityCourtyard, title: "Suncity Heights - Courtyard", category: "exterior" },
  { id: 6, src: rohtak, title: "Rohtak Entrance", category: "exterior" },
  { id: 7, src: rohtakGate, title: "Rohtak Gate", category: "exterior" },
  { id: 8, src: officeStorefront, title: "Office Storefront", category: "office" },
  { id: 9, src: buildingExterior, title: "Building Exterior", category: "exterior" },
  { id: 10, src: flatInterior, title: "Flat Interior", category: "interior" },
  { id: 11, src: floorPlan2bhk, title: "2 BHK Floor Plan - 955 Sq. Ft.", category: "floorplan" },
  { id: 12, src: floorPlan2bhkAlt, title: "2 BHK Floor Plan - Alternate", category: "floorplan" },
  { id: 13, src: floorPlan3bhk, title: "3 BHK Floor Plan - 1250 Sq. Ft.", category: "floorplan" },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredImages = filter === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

  const currentIndex = selectedImage !== null 
    ? galleryImages.findIndex(img => img.id === selectedImage)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedImage(galleryImages[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < galleryImages.length - 1) {
      setSelectedImage(galleryImages[currentIndex + 1].id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-r from-primary/90 to-primary-dark/90">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Photo Gallery</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Explore our stunning property collection
            </p>
          </div>
        </section>

        {/* Filter Buttons */}
        <section className="py-8 bg-background sticky top-0 z-10 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                All Photos
              </button>
              <button
                onClick={() => setFilter("exterior")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === "exterior"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                Exterior
              </button>
              <button
                onClick={() => setFilter("interior")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === "interior"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                Interior
              </button>
              <button
                onClick={() => setFilter("floorplan")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === "floorplan"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                Floor Plans
              </button>
              <button
                onClick={() => setFilter("office")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === "office"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                Office
              </button>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer aspect-square"
                  onClick={() => setSelectedImage(image.id)}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <h3 className="text-white font-semibold text-sm">{image.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          {currentIndex !== -1 && (
            <div className="relative w-full h-full flex items-center justify-center p-12">
              <img
                src={galleryImages[currentIndex].src}
                alt={galleryImages[currentIndex].title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-lg font-medium">
                  {galleryImages[currentIndex].title}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {currentIndex + 1} / {galleryImages.length}
                </p>
              </div>

              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  ←
                </button>
              )}

              {currentIndex < galleryImages.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  →
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Gallery;
