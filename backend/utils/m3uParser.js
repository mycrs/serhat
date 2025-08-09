const axios = require('axios');

class M3UParser {
  static async parseFromUrl(url) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      return this.parseContent(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch M3U from URL: ${error.message}`);
    }
  }

  static parseContent(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const channels = [];
    
    if (!lines[0] || !lines[0].includes('#EXTM3U')) {
      throw new Error('Invalid M3U format');
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('#EXTINF:')) {
        const nextLine = lines[i + 1];
        if (nextLine && !nextLine.startsWith('#')) {
          const channel = this.parseExtInf(line, nextLine);
          if (channel) {
            channels.push(channel);
          }
          i++; // Skip the URL line as we've processed it
        }
      }
    }

    return channels;
  }

  static parseExtInf(extinfLine, urlLine) {
    try {
      // Parse EXTINF line: #EXTINF:duration,title
      const extinfMatch = extinfLine.match(/#EXTINF:([^,]*),(.*)$/);
      if (!extinfMatch) return null;

      const title = extinfMatch[2].trim();
      const url = urlLine.trim();

      // Extract additional attributes from EXTINF line
      const logoMatch = extinfLine.match(/tvg-logo="([^"]*)"/);
      const groupMatch = extinfLine.match(/group-title="([^"]*)"/);
      const idMatch = extinfLine.match(/tvg-id="([^"]*)"/);

      return {
        name: title,
        url: url,
        logo: logoMatch ? logoMatch[1] : '',
        group: groupMatch ? groupMatch[1] : 'Uncategorized',
        tvgId: idMatch ? idMatch[1] : ''
      };
    } catch (error) {
      console.error('Error parsing EXTINF line:', error);
      return null;
    }
  }

  static validateM3UFormat(content) {
    const lines = content.split('\n').map(line => line.trim());
    return lines.length > 0 && lines[0].includes('#EXTM3U');
  }
}

module.exports = M3UParser;