import request from 'requestretry'

function get(options) {
  const customOptions = {
    ...options,
    method: 'GET',
  }

  return _makeRequest(customOptions)
}

function post(options) {
  const customOptions = {
    ...options,
    method: 'POST',
    json: true,
  }

  return _makeRequest(customOptions)
}

function _makeRequest(options) {
  return request({
    ...options,
    maxAttempts: 5,
  })
}

export {
  get,
  post,
}
