import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { playlistAPI, categoryAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    categoryId: '',
    updateFrequency: 'hourly'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playlistsRes, categoriesRes] = await Promise.all([
        playlistAPI.getAll(),
        categoryAPI.getAll()
      ]);
      setPlaylists(playlistsRes.data.playlists || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (playlist = null) => {
    if (playlist) {
      setEditingPlaylist(playlist);
      setFormData({
        name: playlist.name,
        url: playlist.url,
        description: playlist.description || '',
        categoryId: playlist.categoryId?._id || '',
        updateFrequency: playlist.updateFrequency || 'hourly'
      });
    } else {
      setEditingPlaylist(null);
      setFormData({
        name: '',
        url: '',
        description: '',
        categoryId: '',
        updateFrequency: 'hourly'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlaylist(null);
    setFormData({
      name: '',
      url: '',
      description: '',
      categoryId: '',
      updateFrequency: 'hourly'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        categoryId: formData.categoryId || null
      };

      if (editingPlaylist) {
        await playlistAPI.update(editingPlaylist._id, submitData);
        toast.success('Playlist updated successfully');
      } else {
        await playlistAPI.create(submitData);
        toast.success('Playlist created successfully');
      }
      
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast.error(error.response?.data?.error || 'Failed to save playlist');
    }
  };

  const handleDelete = async (playlist) => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      try {
        await playlistAPI.delete(playlist._id);
        toast.success('Playlist deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting playlist:', error);
        toast.error('Failed to delete playlist');
      }
    }
  };

  const handleRefresh = async (playlist) => {
    try {
      toast.loading('Refreshing playlist...');
      await playlistAPI.refresh(playlist._id);
      toast.dismiss();
      toast.success('Playlist refreshed successfully');
      fetchData();
    } catch (error) {
      toast.dismiss();
      console.error('Error refreshing playlist:', error);
      toast.error('Failed to refresh playlist');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
            <p className="text-gray-600">Manage your M3U playlists</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Playlist</span>
          </button>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm text-gray-600 mb-2">{playlist.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{playlist.channelCount || 0} channels</span>
                    {playlist.categoryId && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {playlist.categoryId.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`w-3 h-3 rounded-full ${
                    playlist.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(playlist.lastUpdated).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Update frequency: {playlist.updateFrequency}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRefresh(playlist)}
                    className="text-green-600 hover:text-green-800"
                    title="Refresh"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openModal(playlist)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(playlist)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  playlist.updateFrequency === 'hourly' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {playlist.updateFrequency}
                </span>
              </div>
            </div>
          ))}
        </div>

        {playlists.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <EyeIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first M3U playlist.</p>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Playlist
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingPlaylist ? 'Edit Playlist' : 'Create Playlist'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M3U URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category (optional)</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Frequency
                </label>
                <select
                  value={formData.updateFrequency}
                  onChange={(e) => setFormData({...formData, updateFrequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {editingPlaylist ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}