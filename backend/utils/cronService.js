const cron = require('node-cron');
const Playlist = require('../models/Playlist');
const playlistController = require('../controllers/playlistController');

class CronService {
  static init() {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      console.log('Starting hourly playlist update...');
      await this.updateHourlyPlaylists();
    });

    console.log('Cron service initialized - will update playlists every hour');
  }

  static async updateHourlyPlaylists() {
    try {
      const playlists = await Playlist.find({
        isActive: true,
        updateFrequency: 'hourly'
      });

      console.log(`Found ${playlists.length} playlists to update`);

      for (const playlist of playlists) {
        try {
          console.log(`Updating playlist: ${playlist.name}`);
          await playlistController.updatePlaylistChannels(playlist._id);
          console.log(`Successfully updated playlist: ${playlist.name}`);
        } catch (error) {
          console.error(`Failed to update playlist ${playlist.name}:`, error.message);
        }
      }

      console.log('Hourly playlist update completed');
    } catch (error) {
      console.error('Error during hourly playlist update:', error);
    }
  }

  // Manual trigger for testing
  static async triggerUpdate() {
    console.log('Manually triggering playlist update...');
    await this.updateHourlyPlaylists();
  }
}

module.exports = CronService;