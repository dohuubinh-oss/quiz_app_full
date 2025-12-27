
/**
 * Tải tệp lên máy chủ thông qua API route.
 * @param file - Tệp cần tải lên.
 * @returns Promise chứa đường dẫn công khai của tệp đã tải lên hoặc null nếu thất bại.
 */
export const uploadCoverImage = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return result.path; // Trả về đường dẫn công khai, ví dụ: /uploads/image.png
    } else {
      console.error('Upload failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
