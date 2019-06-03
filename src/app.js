// Song: "Mountain Man" - "Yabadum"

import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'

import * as playlistLib from './PlaylistData'
import * as storageLib from './DataTransactions'
import songTrackingLib from './SongTracking'
import fetchUserId from './UserData'
import { spotifyAuthLib, lastFmAuthLib } from './Authentication'
import { logger } from './Utils'

import {
  refreshTokenCookieKey,
  lastFmTokenCookieKey,
} from './constants'

const app = express()

app.use(express.static(__dirname + './../public'))
  .use(cors())
  .use(cookieParser())
  .use(bodyParser.urlencoded({extended: false}))

// initial permissions fetching
app.get('/login', async function(req, res) {
  const lastFmId = req.query.lastFmUserId
  res.cookie(lastFmTokenCookieKey, lastFmId)

  try {
    await lastFmAuthLib.findUser(lastFmId)
    spotifyAuthLib.requestInitialAuth(res)
  } catch (error) {
    res.send('Could not verify user data')
  }
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
    // sort out spotify tokens
    const refreshToken = req.cookies[refreshTokenCookieKey]
    const lastFmUsername = req.cookies[lastFmTokenCookieKey]

    logger.info(`Fetching the tokens from the cookies: ${req.cookies}`)

    const spotifyTokens = await spotifyAuthLib.refreshTokens(refreshToken)
    const accessToken = spotifyTokens.accessToken

    logger.info(`Fetched tokens from Spotify: ${spotifyTokens}`)
    logger.info(`Fetched an access token from Spotify: ${accessToken}`)

    // store the new user
    await storageLib.store(lastFmUsername, refreshToken)

    logger.info(`Stored the tokens`)

    const fileLoc = path.resolve(`${__dirname}./../public/done/index.html`)
    res.sendFile(fileLoc)
  } catch(err) {
    res.send('There was an error')
    logger.fatal(`Issue creating a subscription: ${err}`)
  }
})

app.listen(8002, () => {
  console.log('Example app listening on port 8002!')
})
