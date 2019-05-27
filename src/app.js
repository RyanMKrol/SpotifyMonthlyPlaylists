// Song: "Mountain Man" - "Yabadum"

import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'

import * as storageLib from './DataStorage'
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

    const refreshToken = req.cookies[refreshTokenCookieKey]
    const lastFmUsername = req.cookies[lastFmTokenCookieKey]

    await storageLib.store(refreshToken, lastFmUsername)

    // fetch recent tracks

    // search for tracks using spotify's api

    // store the tracks in a playlist

    const fileLoc = path.resolve(`${__dirname}./../public/done/index.html`)
    res.sendFile(fileLoc)
  } catch(err) {
    console.log(err)
    logger.fatal(`Issue fetching access tokens with error: ${err}`)
  }
})

app.listen(8002, () => {
  console.log('Example app listening on port 8002!')
})
