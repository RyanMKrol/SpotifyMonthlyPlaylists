import * as requestLib from './../RequestLib'
import lastFmRetryStrategy from './LastFmRetryStrategy'
import spotifyRetryStrategy from './SpotifyRetryStrategy'
import spotifyDelayStrategy from './SpotifyDelayStrategy'

const API_KEY = require(`${__dirname}/../../credentials/lastFmCredentials.json`).secret
const RETRY_TIME = 2000
const BASE_LAST_FM_API_URL = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&format=json&period=1month&limit=50&api_key=${API_KEY}`
const BASE_SPOTIFY_API_URL = `https://api.spotify.com/v1/search?limit=1&type=track`

async function fetchRecentTopSongs(username) {
  console.log(`${BASE_LAST_FM_API_URL}&user=${username}`)
  const apiOptions = {
    url: `${BASE_LAST_FM_API_URL}&user=${username}`,
    json: true,
    retryDelay: RETRY_TIME,
    retryStrategy: lastFmRetryStrategy,
  }

  return requestLib.get(apiOptions)
    .then((response) => {
      try {
        return response.body.toptracks.track
      } catch (error) {
        throw new Error(error)
      }
    }).catch((error) => {
      throw new Error(error)
    })
}

async function fetchSpotifySongId(lastFmTrackItem, accessToken) {
  const trackName = lastFmTrackItem.songName
  const artistName = lastFmTrackItem.artistName
  const url = encodeURI(`${BASE_SPOTIFY_API_URL}&q=track:${trackName} artist:${artistName}`)

  const searchApiOptions = {
    url,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    delayStrategy: spotifyDelayStrategy,
    retryStrategy: spotifyRetryStrategy,
  }

  return requestLib.get(searchApiOptions)
    .then((response) => {
      try {
        const responseBody = JSON.parse(response.body)
        if (responseBody.tracks.items.length !== 0) {
          return responseBody.tracks.items[0].uri
        }
        return
      } catch (error) {
        throw new Error(error)
      }
    }).catch((error) => {
      throw new Error(error)
    })
}

export {
  fetchRecentTopSongs,
  fetchSpotifySongId,
}
