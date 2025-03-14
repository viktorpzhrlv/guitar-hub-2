/**
 * Uploads an image to ImgBB and returns the URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', process.env.NEXT_PUBLIC_IMGBB_API_KEY || '');
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      console.error('ImgBB upload error:', data.error);
      throw new Error(data.error?.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Image upload failed:', error);
    throw new Error('Failed to upload image. Please try again later.');
  }
}

/**
 * Uploads multiple images to ImgBB and returns an array of URLs
 */
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple image upload failed:', error);
    throw new Error('Failed to upload some or all images. Please try again.');
  }
}

