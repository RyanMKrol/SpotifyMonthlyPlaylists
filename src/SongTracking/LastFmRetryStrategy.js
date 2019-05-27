function retryStrategy(err, response, body, options){
  return !!err || response.statusCode !== 200
}

export default retryStrategy
