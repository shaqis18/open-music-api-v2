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

module.exports = {
  albumsdb, songsdb,
};