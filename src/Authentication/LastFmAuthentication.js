import * as requestLib from './../RequestLib'
import retryStrategy from './RetryStrategy'

const apiKey = require(`${__dirname}/../../config.json`).lastFmSecret
const baseUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.getinfo'
const RETRY_DELAY = 5000

function findUser(username) {
  const topTracksApiOptions = {
    url: `${baseUrl}&user=${username}&api_key=${apiKey}&format=json`,
    retryDelay: RETRY_DELAY,
    retryStrategy: retryStrategy,
  }

  return requestLib.get(url)
    .catch((error) => {
      throw new Error('Could not fetch the tokens we need')
    })
}

export {
  findUser,
}
