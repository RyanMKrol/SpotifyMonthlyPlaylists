import * as requestLib from './../RequestLib'
import retryStrategy from './SongTrackingRetryStrategy'

const API_KEY = require(`${__dirname}/../../credentials/lastFmCredentials.json`).secret
const BASE_API_URL = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&format=json&period=1month&limit=50&api_key=${API_KEY}`
const RETRY_TIME = 2000

console.log(requestLib)

async function fetchRecentSongs(username) {
  const apiOptions = {
    url: `${BASE_API_URL}&user=${username}`,
    json: true,
    retryDelay: RETRY_TIME,
    retryStrategy: retryStrategy,
  }

  return requestLib.get(apiOptions)
    .then((response) => {
      try {
        // console.log(response)
        console.log(response.statusCode)
        console.log(response.body)
        return response.body.toptracks.track
      } catch (error) {
        throw new Error(error)
      }
    }).catch((error) => {
      throw new Error(error)
    })
}

export default fetchRecentSongs
