const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server) => {
    const playlistsHandler = new PlaylistsHandler();
    server.route(routes(playlistsHandler));
  },
};