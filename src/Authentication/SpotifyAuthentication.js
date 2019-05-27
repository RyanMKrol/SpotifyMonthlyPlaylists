import querystring from 'querystring'
import uuid from 'uuid/v1'

import * as requestLib from './../RequestLib'

const CLIENT_ID = 'f73b560c5a4848609c056470b4c2872c'
const CLIENT_SECRET = require(`${__dirname}/../../credentials/spotifyCredentials.json`).secret
const REDIRECT_URL = encodeURI('http://localhost:8002/callback')
const PERMISSIONS_LIST = 'user-read-private playlist-modify-public playlist-modify-private'

// user permits us to act on their behalf
function requestInitialAuth(httpResponse) {
    const state = uuid()

    const authoriseParams = querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: PERMISSIONS_LIST,
      redirect_uri: REDIRECT_URL,
      state: state
    })

    httpResponse.redirect(`https://accounts.spotify.com/authorize?${authoriseParams}`)
}

// double handshake - we use a code passed back from Spotify to fetch the access tokens
function requestApiTokens(httpRequest, httpResponse) {
  const authOptions = buildAuthOptions(httpRequest)
  return fetchTokens(authOptions)
}

function refreshTokens(refreshToken) {
  const authOptions = buildRefreshAuthOptions(refreshToken)
  return fetchTokens(authOptions)
}

function fetchTokens(authOptions) {
  return requestLib.post(authOptions)
  .then((response) => {
    return ({
      "accessToken": response.body.access_token,
      "refreshToken": response.body.refresh_token
    })
  }).catch((error) => {
    throw new Error('Could not fetch the tokens we need')
  })
}
function buildRefreshAuthOptions(refreshToken) {
  const authToken = new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')

  return {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    headers: {
      'Authorization': `Basic ${authToken}`
    },
    json: true
  }
}

function buildAuthOptions(httpRequest) {
  const code = httpRequest.query.code
  const authToken = new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')

  return {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URL,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': `Basic ${authToken}`
    },
    json: true
  }
}

export {
  requestInitialAuth,
  requestApiTokens,
  refreshTokens,
}
