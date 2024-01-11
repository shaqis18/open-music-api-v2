const albumsdb = ({
  id, name, year,
}) => ({
  id, name, year,
});

const songsdb = ({
  id, title, performer, genre, duration, albumId,
}) => ({
  id, title, performer, genre, duration, albumId,
});

const filterTitleSongs = (song, title) => (song.title.toLowerCase().includes(title));

const filterPerformerSongs = (song, performer) => (
  song.performer.toLowerCase().includes(performer));

module.exports = {
  albumsdb, songsdb, filterTitleSongs, filterPerformerSongs,
};