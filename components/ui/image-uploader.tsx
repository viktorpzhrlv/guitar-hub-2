"use client";

import { useState, useCallback } from "react";
import { uploadImage, uploadMultipleImages } from "@/lib/image-upload";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageUploaderProps {
  onImageUploaded?: (url: string) => void;
  onImagesUploaded?: (urls: string[]) => void;
  multiple?: boolean;
  existingImages?: string[];
  onImagesChange?: (images: string[]) => void;
  className?: string;
}

export function ImageUploader({
  onImageUploaded,
  onImagesUploaded,
  multiple = false,
  existingImages = [],
  onImagesChange,
  className,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(existingImages);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length) return;

      setIsUploading(true);
      setError(null);

      try {
        if (multiple) {
          const files = Array.from(event.target.files);
          const urls = await uploadMultipleImages(files);
          
          const updatedImages = [...images, ...urls];
          setImages(updatedImages);
          onImagesUploaded?.(urls);
          onImagesChange?.(updatedImages);
        } else {
          const url = await uploadImage(event.target.files[0]);
          setImages([url]);
          onImageUploaded?.(url);
          onImagesChange?.([url]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload image"
        );
      } finally {
        setIsUploading(false);
        // Reset the input value so the same file can be selected again if needed
        event.target.value = "";
      }
    },
    [multiple, onImageUploaded, onImagesUploaded, onImagesChange, images]
  );

  const removeImage = useCallback(
    (indexToRemove: number) => {
      const updatedImages = images.filter((_, index) => index !== indexToRemove);
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
    },
    [images, onImagesChange]
  );

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="relative group">
            <Image
              src={image}
              alt={`Uploaded image ${index + 1}`}
              width={100}
              height={100}
              className="object-cover rounded-md border border-gray-200"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
      </div>
      
      <div>
        <Input
          type="file"
          onChange={handleUpload}
          disabled={isUploading}
          accept="image/*"
          multiple={multiple}
          className="cursor-pointer"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {multiple 
            ? "Upload one or more images (JPG, PNG, GIF up to 16MB each)" 
            : "Upload an image (JPG, PNG, GIF up to 16MB)"}
        </p>
      </div>

      {isUploading && <p className="text-sm text-amber-500">Uploading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}