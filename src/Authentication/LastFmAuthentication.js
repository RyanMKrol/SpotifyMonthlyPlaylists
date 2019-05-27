import * as requestLib from './../RequestLib'
import retryStrategy from './LastFmRetryStrategy'

const apiKey = require(`${__dirname}/../../config.json`).lastFmSecret
const baseUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.getinfo'
const RETRY_DELAY = 1000

async function findUser(username) {
  const lastFmOptions = {
    url: `${baseUrl}&user=${username}&api_key=${apiKey}&format=json`,
    retryDelay: RETRY_DELAY,
    retryStrategy: retryStrategy,
    maxAttempts: 3,
  }

  return requestLib.get(lastFmOptions)
    .then((response) => {
      if (response.statusCode === 404) {
        throw new Error(`Could not find user: ${username}`)
      } else if (response.statusCode !== 200) {
        throw new Error('Internal Server Error')
      } else {
        return
      }
    })
    .catch((error) => {
      throw new Error(error)
    })
}

export {
  findUser,
}
