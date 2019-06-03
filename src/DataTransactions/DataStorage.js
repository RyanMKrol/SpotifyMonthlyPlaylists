import mysql from 'mysql'

const mysqlCredentials = require(`${__dirname}/../../credentials/mysqlCredentials.json`)
const connection = mysql.createConnection(mysqlCredentials)

async function store(lastFmUsername, refreshToken) {
  const queryString = buildSqlQuery(lastFmUsername, refreshToken)

  return new Promise((resolve, reject) => {
    connection.query(queryString, function (error, results, fields) {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

function buildSqlQuery(lastFmUsername, refreshToken) {
  const escapedUsername = connection.escape(lastFmUsername)
  const escapedRefreshToken = connection.escape(refreshToken)

  const baseQuery = 'INSERT INTO users (songkickUsername, refreshToken) VALUES'
  const queryValues = `(${escapedUsername}, ${escapedRefreshToken})`
  const postQueryString = `ON DUPLICATE KEY UPDATE songkickUsername=${escapedUsername}, refreshToken=${escapedRefreshToken};`

  return `${baseQuery} ${queryValues} ${postQueryString}`
}

export default store
