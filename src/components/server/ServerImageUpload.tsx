
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ServerImageUploadProps } from "./types";

export const ServerImageUpload = ({ 
  server, 
  type, 
  currentUrl, 
  onUploadComplete,
  isOwner 
}: ServerImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxSize) {
        toast.error(`File size must be less than 5MB`);
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];
      
      if (!allowedTypes.includes(fileExt?.toLowerCase() || '')) {
        toast.error('Only image files (PNG, JPG, JPEG, GIF) are allowed');
        return;
      }
      
      setUploading(true);
      const fileName = `${server.id}/${type}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('server-assets')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('server-assets')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('servers')
        .update(type === 'icon' ? { icon_url: publicUrl } : { banner_url: publicUrl })
        .eq('id', server.id);

      if (updateError) throw updateError;

      onUploadComplete();
      toast.success(`Server ${type} updated successfully`);
      
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentUrl && (
        <img 
          src={currentUrl} 
          alt={`Server ${type}`} 
          className={type === 'icon' ? "w-12 h-12 rounded-full object-cover" : "w-20 h-12 rounded object-cover"}
        />
      )}
      <Button 
        variant="outline" 
        disabled={!isOwner || uploading}
        onClick={() => document.getElementById(`${type}-upload`)?.click()}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload {type === 'icon' ? 'Icon' : 'Banner'}
      </Button>
      <input
        type="file"
        id={`${type}-upload`}
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={!isOwner || uploading}
      />
    </div>
  );
};

