const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const AuthorizationError = require('../../exception/AuthError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan.');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      left join collaborations on collaborations.playlist_id = playlists.id
      left join users on users.id = playlists.owner
      where playlists.owner = $1 or collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPlaylistsById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      INNER JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlistSong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Song gagal ditambahkan ke dalam playlist.');
    }
    return result.rows[0].id;
  }

  async addPlaylistSongActivities({
    playlistId, songId, credentialId, action,
  }) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1,$2,$3,$4,$5,$6) RETURNING user_id, playlist_id',
      values: [id, playlistId, songId, credentialId, action, time],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Acitivies gagal ditambahkan');
    }
    return result.rows[0];
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `select users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
      from playlist_song_activities
      left join users on users.id = playlist_song_activities.user_id
      left join songs on songs.id = playlist_song_activities.song_id
      where playlist_song_activities.playlist_id = $1
      `,
      values: [playlistId.id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Activities tidak ditemukan');
    }

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async deleteSongFromPlaylist(songId, playlistId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING song_id',
      values: [songId, playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu di playlist gagal di hapus. Id tidak ditemukan');
    }
    return result.rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;