// Song: "All Falls Down" - "Kanye West"

import schedule from 'node-schedule'

import * as playlistLib from './PlaylistData'
import * as storageLib from './DataTransactions'
import songTrackingLib from './SongTracking'
import fetchUserId from './UserData'
import { spotifyAuthLib } from './Authentication'
import { logger } from './Utils'

async function main() {
  try {
    const userData = await storageLib.fetch()

    logger.info(`Gathered user data: ${userData.toString()}`)

    for (const user of userData) {
      const lastFmUsername = user.songkickUsername
      const refreshToken = user.refreshToken
      const spotifyTokens = await spotifyAuthLib.refreshTokens(refreshToken)
      const accessToken = spotifyTokens.accessToken

      logger.info(`LastFM Username: ${lastFmUsername}`)
      logger.info(`Refresh Token: ${refreshToken}`)
      logger.info(`Spotify Tokens: ${spotifyTokens}`)
      logger.info(`Access Token: ${accessToken}`)

      // find what the user has been listening to
      const rawSongData = await songTrackingLib.fetchRecentTopSongs(lastFmUsername)

      // grab the relevant data from our songs
      const songData = rawSongData.map((songItem) => {
        return {
          songName: songItem.name,
          artistName: songItem.artist.name,
        }
      })

      // find the spotify track IDs for each track
      const spotifySongIdTasks = songData.map(async (item) => {
        return songTrackingLib.fetchSpotifySongId(item, accessToken)
      })

      const spotifySongIds = (await Promise.all(spotifySongIdTasks))
        .filter((x) => x !== undefined)

      logger.info(`Spotify Song IDs: ${spotifySongIds.toString()}`)

      // grab the user ID
      const userId = await fetchUserId(accessToken)

      logger.info(`User ID: ${userId}`)

      // create a playlist for this month
      const playlistId = await playlistLib.createPlaylist(accessToken, userId)

      logger.info(`Created a playlist`)

      // add songs to the playlist
      const _ = await playlistLib.addTracksToPlaylist(accessToken, playlistId, spotifySongIds)

      logger.info(`Added songs to the playlist - Done`)
    }
  } catch(err) {
    console.log(err)
    logger.fatal(`Issue creating a subscription: ${err}`)
  }
}

schedule.scheduleJob('0 0 0 1 * *', () => {
  logger.info(`Running the playlist creator`)
  main()
})
