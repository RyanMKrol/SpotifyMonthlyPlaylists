// Song: "Mountain Man" - "Yabadum"

import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'

import {
  spotifyAuthLib,
  lastFmAuthLib,
} from './Authentication'

import {
  accessTokenCookieKey,
  refreshTokenCookieKey,
  defaultTracksPerArtist,
} from './constants'
import { logger } from './Utils'

const app = express()

app.use(express.static(__dirname + './../public'))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser.urlencoded({extended: false}))

// initial permissions fetching
app.get('/login', function(req, res) {
  logger.info('Logging in')
  spotifyAuthLib.requestInitialAuth(res)
})

app.get('/callback', async function(req, res) {
  try {
    logger.info('Fetching the access tokens')

    // getting specific tokens for API requests
    const tokens = await spotifyAuthLib.requestApiTokens(req, res)

    res.cookie(refreshTokenCookieKey, tokens.refreshToken)

    res.redirect(`/setupSubscription`)
  } catch(err) {
    logger.fatal(`Issue fetching access tokens with error: ${err}`)
  }
})

app.get('/setupSubscription', async function(req, res) {
  try {
    const fileLoc = path.resolve(`${__dirname}./../public/done/index.html`)
    res.sendFile(fileLoc)
  } catch(err) {
    logger.fatal(`Issue fetching access tokens with error: ${err}`)
  }
})

app.listen(8002, () => {
  console.log('Example app listening on port 8002!')
})
