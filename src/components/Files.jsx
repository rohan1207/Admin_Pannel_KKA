import { useState, useEffect, useRef } from 'react';
import {
  FolderIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  GlobeAmericasIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';

const Files = () => {
  const [activeCategory, setActiveCategory] = useState('us-tax-forms');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const categories = [
    {
      id: 'us-tax-forms',
      name: 'U.S. Tax Forms',
      icon: GlobeAmericasIcon,
      description: 'Essential U.S. tax forms and documents'
    },
    {
      id: 'india-tax-forms',
      name: 'India Tax Forms',
      icon: GlobeAltIcon,
      description: 'Important Indian tax forms and guidelines'
    },
    {
      id: 'client-resources',
      name: 'Client Resources',
      icon: FolderIcon,
      description: 'Helpful guides and resources for clients'
    },
    {
      id: 'tax-treaties',
      name: 'Tax Treaties',
      icon: DocumentIcon,
      description: 'U.S.-India tax treaty documents and updates'
    }
  ];

  const handleFileUpload = async (event) => {
    try {
      setLoading(true);
      const uploadedFiles = Array.from(event.target.files);
      
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${activeCategory}/${fileName}`;
        const version = 1; // Initial version

        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('tax-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Add file metadata to the database
        const { error: dbError } = await supabase
          .from('documents')
          .insert([
            {
              name: file.name,
              path: filePath,
              category: activeCategory,
              size: file.size,
              type: file.type,
              version: version,
              uploaded_at: new Date(),
              shared_with: []
            }
          ]);

        if (dbError) throw dbError;
      }
      
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    } finally {
      setLoading(false);
    }
  };

  const handleFilePreview = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from('tax-documents')
        .createSignedUrl(file.path, 3600); // 1-hour signed URL

      if (error) throw error;

      setPreviewFile({
        ...file,
        url: data.signedUrl
      });
    } catch (error) {
      console.error('Error creating preview URL:', error);
      alert('Error previewing file');
    }
  };

  const handleShare = async (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleCreateShareLink = async (expiryHours = 24) => {
    try {
      const { data, error } = await supabase.storage
        .from('tax-documents')
        .createSignedUrl(selectedFile.path, expiryHours * 3600);

      if (error) throw error;

      // Update shared_with in database
      await supabase
        .from('documents')
        .update({
          shared_with: [...(selectedFile.shared_with || []), {
            url: data.signedUrl,
            expires_at: new Date(Date.now() + expiryHours * 3600000).toISOString()
          }]
        })
        .eq('id', selectedFile.id);

      // Copy link to clipboard
      navigator.clipboard.writeText(data.signedUrl);
      alert('Share link copied to clipboard!');
      setShowShareModal(false);
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Error creating share link');
    }
  };

  const handleNewVersion = async (file, event) => {
    try {
      const newFile = event.target.files[0];
      const fileExt = newFile.name.split('.').pop();
      const fileName = `${file.path.split('/').pop().split('.')[0]}_v${file.version + 1}.${fileExt}`;
      const filePath = `${activeCategory}/${fileName}`;

      // Upload new version
      const { error: uploadError } = await supabase.storage
        .from('tax-documents')
        .upload(filePath, newFile);

      if (uploadError) throw uploadError;

      // Update database
      const { error: dbError } = await supabase
        .from('documents')
        .update({
          version: file.version + 1,
          path: filePath,
          size: newFile.size,
          type: newFile.type,
          uploaded_at: new Date()
        })
        .eq('id', file.id);

      if (dbError) throw dbError;

      fetchFiles();
    } catch (error) {
      console.error('Error uploading new version:', error);
      alert('Error uploading new version');
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('category', activeCategory)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (filePath, id) => {
    try {
      setLoading(true);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('tax-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Document Management</h1>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <label className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer">
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Upload Files</span>
              <span className="sm:hidden">Upload</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={loading}
                ref={fileInputRef}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Categories Sidebar */}
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-4 pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center p-3 md:p-4 rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <category.icon className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-sm md:text-base">{category.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500 hidden md:block">{category.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Files Grid */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  {categories.find(c => c.id === activeCategory)?.name}
                </h2>
                
                {loading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <DocumentIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload files to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="relative group p-3 sm:p-4 border rounded-lg hover:border-orange-500 transition-colors"
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <DocumentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              v{file.version} • {new Date(file.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="hidden group-hover:flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleFilePreview(file)}
                              className="p-1 text-gray-500 hover:text-orange-600"
                            >
                              <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => handleShare(file)}
                              className="p-1 text-gray-500 hover:text-orange-600"
                            >
                              <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <label className="p-1 text-gray-500 hover:text-orange-600 cursor-pointer">
                              <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleNewVersion(file, e)}
                              />
                            </label>
                            <button
                              onClick={() => deleteFile(file.path, file.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-3 sm:p-4 border-b flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-medium truncate">{previewFile.name}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-2 sm:p-4 h-[80vh] overflow-auto">
              {previewFile.type.includes('image') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full h-auto"
                />
              ) : previewFile.type.includes('pdf') ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p>Preview not available for this file type.</p>
                  <a
                    href={previewFile.url}
                    download
                    className="mt-4 inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium mb-4">Share Document</h3>
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={() => handleCreateShareLink(24)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Generate 24-hour Link
              </button>
              <button
                onClick={() => handleCreateShareLink(168)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Generate 7-day Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files; 