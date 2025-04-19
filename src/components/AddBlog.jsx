import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';

const AddBlog = () => {
  const [formData, setFormData] = useState({
    TITLE: '',
    SHORT_INFO: '',
    AUTHOR: '',
    CONTENT: '',
    IMAGE_URL: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      CONTENT: content
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        Swal.fire({
          title: 'Error!',
          text: 'Image size should be less than 5MB',
          icon: 'error',
          confirmButtonColor: '#4DA0B0'
        });
        return;
      }
      setImageFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          IMAGE_URL: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      // Create a unique file name
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('blog-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Return just the filename instead of the full URL
      return fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.CONTENT) {
      Swal.fire({
        title: 'Error!',
        text: 'Please add some content to your blog post',
        icon: 'error',
        confirmButtonColor: '#4DA0B0'
      });
      return;
    }

    setLoading(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage();
      
      // Insert directly into the demo table
      const { error } = await supabase
        .from('demo')
        .insert([{
          TITLE: formData.TITLE,
          SHORT_INFO: formData.SHORT_INFO,
          AUTHOR: formData.AUTHOR || 'Admin',
          CONTENT: formData.CONTENT,
          IMAGE_URL: imageUrl, // This will now be just the filename
          date: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Blog post created successfully',
        icon: 'success',
        confirmButtonColor: '#4DA0B0'
      });

      // Reset form
      setFormData({
        TITLE: '',
        SHORT_INFO: '',
        AUTHOR: '',
        CONTENT: '',
        IMAGE_URL: ''
      });
      setImageFile(null);

    } catch (error) {
      console.error('Form submission error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to create blog post',
        icon: 'error',
        confirmButtonColor: '#4DA0B0'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add New Blog Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="TITLE"
            value={formData.TITLE}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DA0B0] focus:border-transparent"
          />
        </div>

        {/* Short Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea
            name="SHORT_INFO"
            value={formData.SHORT_INFO}
            onChange={handleInputChange}
            required
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DA0B0] focus:border-transparent"
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <input
            type="text"
            name="AUTHOR"
            value={formData.AUTHOR}
            onChange={handleInputChange}
            placeholder="Admin"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DA0B0] focus:border-transparent"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blog Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DA0B0] focus:border-transparent"
          />
          {formData.IMAGE_URL && (
            <div className="mt-2">
              <img 
                src={formData.IMAGE_URL.startsWith('data:') 
                  ? formData.IMAGE_URL 
                  : `https://frjabqpvtjqfhfscapke.supabase.co/storage/v1/object/public/blog-images/${formData.IMAGE_URL}`} 
                alt="Preview" 
                className="max-h-40 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <Editor
            apiKey="zn1sh36buxp3bk7vnrurs6mt9l093amh4agd8bn87xzqndr3"
            value={formData.CONTENT}
            onEditorChange={handleContentChange}
            init={{
              height: 400,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4DA0B0] text-white py-3 px-6 rounded-lg hover:bg-[#3a7a87] transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Blog'}
        </button>
      </form>
    </div>
  );
};

export default AddBlog; 