import { useState } from 'react';
import { supabase } from '@/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, Upload } from 'lucide-react';

interface UploadGalleryProps {
  slug: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

export const UploadGallery = ({ slug, value, onChange }: UploadGalleryProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [urlInput, setUrlInput] = useState('');

  const uploadFiles = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const newUrls: string[] = [];
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${slug}-${i}`;
        
        setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));

        const fileName = `${crypto.randomUUID()}-${file.name}`;
        const filePath = `${slug}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          throw new Error(`Failed to upload ${file.name}`);
        }

        uploadedPaths.push(filePath);

        const { data: publicData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        newUrls.push(publicData.publicUrl);
        setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
      }

      onChange([...value, ...newUrls]);
      toast.success(`${files.length} image(s) uploaded successfully`);
      setUploadProgress({});
    } catch (error: any) {
      // Rollback: delete uploaded files
      for (const path of uploadedPaths) {
        try {
          await supabase.storage.from('property-images').remove([path]);
        } catch (e) {
          console.error('Rollback error:', e);
        }
      }
      toast.error(error.message || 'Upload failed');
      setUploadProgress({});
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...value, urlInput.trim()]);
    setUrlInput('');
    toast.success('URL added to gallery');
  };

  const removeImage = async (url: string, index: number) => {
    // If it's a storage URL, delete from storage
    if (url.includes('supabaseusercontent.com')) {
      try {
        const pathMatch = url.match(/property-images%2F(.+)\?/);
        if (pathMatch) {
          const decodedPath = decodeURIComponent(pathMatch[1]);
          await supabase.storage.from('property-images').remove([decodedPath]);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
    toast.success('Image removed');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Upload Images</label>
        <Input
          type="file"
          multiple
          accept="image/*"
          disabled={isUploading}
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          className="cursor-pointer"
        />
      </div>

      {Object.entries(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Or Paste Image URL</label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
            disabled={isUploading}
          />
          <Button
            onClick={handleAddUrl}
            disabled={isUploading || !urlInput.trim()}
            size="sm"
          >
            Add
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Gallery ({value.length} images)</label>
          <div className="grid grid-cols-3 gap-2">
            {value.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Gallery ${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(url, index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
