import dotenv from 'dotenv'

dotenv.config()

const DEFAULT_CONFIG_KEY = 'dev'
const CONFIG_LOCATION = `${__dirname}/../../config/config.json`

function getConfigEntry(key) {
  const config = require(CONFIG_LOCATION)

  const configLevel = process.env.NODE_ENV

  try {
    const specificEntry = config[configLevel][key]
    const fallbackEntry = config[DEFAULT_CONFIG_KEY][key]

    return specificEntry || fallbackEntry
  } catch (error) {
    return
  }
}

export {
  getConfigEntry
}
