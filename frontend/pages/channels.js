import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { channelAPI, playlistAPI, categoryAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { 
  TvIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    playlistId: '',
    categoryId: '',
    isActive: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [channelsRes, playlistsRes, categoriesRes] = await Promise.all([
        channelAPI.getAll(filters),
        playlistAPI.getAll(),
        categoryAPI.getAll()
      ]);
      
      setChannels(channelsRes.data.channels || []);
      setPagination(channelsRes.data.pagination || {});
      setPlaylists(playlistsRes.data.playlists || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const toggleChannelStatus = async (channel) => {
    try {
      await channelAPI.update(channel._id, {
        isActive: !channel.isActive
      });
      toast.success(`Channel ${channel.isActive ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (error) {
      console.error('Error updating channel:', error);
      toast.error('Failed to update channel');
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Channels</h1>
          <p className="text-gray-600">Browse and manage all channels from your playlists</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex-1 min-w-48">
              <select
                value={filters.playlistId}
                onChange={(e) => handleFilterChange('playlistId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Playlists</option>
                {playlists.map((playlist) => (
                  <option key={playlist._id} value={playlist._id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-32">
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        {channels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {channels.map((channel) => (
                <div key={channel._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate" title={channel.name}>
                        {channel.name}
                      </h3>
                      {channel.group && (
                        <p className="text-xs text-gray-500 mt-1">{channel.group}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleChannelStatus(channel)}
                      className={`w-3 h-3 rounded-full ${
                        channel.isActive ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      title={channel.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                    />
                  </div>

                  {channel.logo && (
                    <div className="mb-3">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-20 object-contain bg-gray-50 rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Playlist:</span>
                      <span className="text-gray-900 truncate max-w-32" title={channel.playlistId?.name}>
                        {channel.playlistId?.name || 'Unknown'}
                      </span>
                    </div>
                    
                    {channel.categoryId && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Category:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {channel.categoryId.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        channel.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {channel.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Stream
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
                <div className="flex justify-between flex-1 sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(pagination.pages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              page === pagination.page
                                ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <TvIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No channels found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters to see more results.'
                : 'Create some playlists to see channels here.'
              }
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}