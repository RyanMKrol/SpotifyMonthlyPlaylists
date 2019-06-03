// Song: "I'll Fly Away" - "Kanye West"

import mysql from 'mysql'

const mysqlCredentials = require(`${__dirname}/../../credentials/mysqlCredentials.json`)
const connection = mysql.createConnection(mysqlCredentials)

async function fetch() {
  const queryString = 'SELECT * FROM users;'

  return new Promise((resolve, reject) => {
    connection.query(queryString, function (error, results, fields) {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

export default fetch
