import React from 'react';
import './App.css';
import axios from 'axios';

import GenreList from './genres.json';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      type: 'track',
      genre: 'random',
      genres: GenreList,
      error: {}
    };

    // this.getGenres();

    this.getGenres = this.getGenres.bind(this);
    this.getRandomSong = this.getRandomSong.bind(this);
    this.handleType = this.handleType.bind(this);
    this.handleGenre = this.handleGenre.bind(this);
  }

  getGenres() {
    axios
      .get('/genres')
      .then(
        response => this.setState({ genres: response.data, error: {} }),
        err => this.setState({ error: err.response.data })
      );
  }

  getRandomSong() {
    const { type, genre } = this.state;

    axios
      .get(`/${type}/${genre}`)
      .then(
        response => this.setState({ randomItem: response.data, error: {} }),
        err => this.setState({ error: err.response.data })
      );
  }

  handleType(event) {
    const { value } = event.target;
    this.setState({ type: value, genre: 'random', randomItem: undefined });
  }

  handleGenre(event) {
    const { value } = event.target;
    this.setState({ genre: value, randomItem: undefined });
  }

  render() {
    const { randomItem, type, genre, genres, error } = this.state;
    return (
      <div className="app bg-primary">
        <div className="header">
          <img className="logo" src="/spotify.svg" alt="spotify logo" />
          <h1 className="text-dark">Random Jams</h1>
        </div>
        {error && error.code && (
          <div className="alert">
            <p>
              Code {error.code} - {error.message}
            </p>
            <button
              className="close"
              type="button"
              onClick={() => this.setState({ error: {} })}
            >
              &times;
            </button>
          </div>
        )}
        <p className="text-light">Step 1 - Single Track or Full Album?</p>
        <select onChange={this.handleType} value={type}>
          <option value="track">Single Track</option>
          <option value="album">Full Album</option>
        </select>
        {type === 'track' ? (
          <div>
            <p className="text-light">Step 2 - Random or Specific Genre?</p>
            <select onChange={this.handleGenre} value={genre}>
              <option value="random">Random</option>
              {genres.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <p className="text-light">Step 2 - Give a keyword</p>
            <input type="text" placeholder="random" />
          </div>
        )}
        <br />
        <button type="button" onClick={this.getRandomSong}>
          Generate
        </button>
        {randomItem && (
          <div>
            <h1>Your {type === 'album' ? 'Album' : 'Track'} -</h1>
            <img
              className="albumArt"
              src={
                randomItem.images
                  ? randomItem.images[0].url
                  : randomItem.album.images[0].url
              }
              alt={`${randomItem.name} Album Art`}
            />
            <h4>
              {randomItem.name}
              <br />
              <em>by {randomItem.artists.map(a => a.name).join(',')}</em>
            </h4>
            <a
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
              href={randomItem.external_urls.spotify}
            >
              Listen
            </a>
          </div>
        )}
        <p className="text-light">
          <small>
            This site was made by{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/BradHacker"
            >
              Bradley Harker
            </a>
            . For support, please contact me at{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="mailto:harkerbd@gmail.com"
            >
              harkerbd@gmail.com
            </a>
          </small>
        </p>
      </div>
    );
  }
}

export default App;
