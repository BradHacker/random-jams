const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.dev') });

const PORT = process.env.PORT || 3001;

const CREDENTIAL_ERROR = {
  code: 1,
  message: "Couldn't retrieve Spotify credentials. Contact Support."
};
const QUERY_ERROR = {
  code: 2,
  message: "Couldn't retrieve data with given query. Contact Support."
};
const OFFSET_ERROR = {
  code: 2,
  message: 'Offset is out of bounds. Contact Support.'
};

const app = express();

const randQueries = ['%a%', 'a%', '%e%', 'e%', '%i%', 'i%', '%o%', 'o%'];

app.use(cors());

app.use(express.static(path.join(__dirname, '../build')));

app.get('/genres', (req, res) => {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET
  });

  spotifyApi.clientCredentialsGrant().then(
    data => {
      spotifyApi.setAccessToken(data.body['access_token']);
      // Get a List of Categories
      spotifyApi.getCategories({ limit: 50 }).then(
        data => {
          res.json(data.body.categories.items.map(i => i.id));
        },
        err => {
          res.status(500).json(QUERY_ERROR);
        }
      );
    },
    err => {
      res.status(500).json(CREDENTIAL_ERROR);
    }
  );
});

app.get('/:type/:genre', (req, res) => {
  const { type, genre } = req.params;
  if (process.env.NODE_ENV === 'development') console.log(type, genre);

  const randQuery = randQueries[Math.floor(Math.random() * randQueries.length)];

  const query =
    genre !== 'random' ? randQuery + ` genre:"${genre}"` : randQuery;
  if (process.env.NODE_ENV === 'development') console.log('query', query);

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET
  });

  spotifyApi.clientCredentialsGrant().then(
    data => {
      // console.log('The access token expires in ' + data.body['expires_in']);
      // console.log('The access token is ' + data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi
        .search(query, [type], {
          limit: 1,
          country: 'US',
          locale: 'en_US'
        })
        .then(
          data => {
            const offset = Math.floor(
              Math.random() * Math.min(data.body[type + 's'].total, 9999)
            );

            if (process.env.NODE_ENV === 'development') {
              console.log('api query:', data.body[type + 's'].href);
              console.log('offset:', offset);
            }
            spotifyApi
              .search(query, [type], {
                limit: 1,
                offset,
                country: 'US',
                locale: 'en_US'
              })
              .then(
                d => res.json(d.body[type + 's'].items[0]),
                err => res.status(500).json(OFFSET_ERROR)
              );
          },
          err => res.status(500).json(QUERY_ERROR)
        );
    },
    err => {
      res.status(500).json(CREDENTIAL_ERROR);
    }
  );
});

app.get('*', (req, res) => {
  res.sendFile('../build/index.html');
});

app.listen(PORT, () =>
  console.log(`Started at ${new Date().toISOString()} | Listening on ${PORT}`)
);
