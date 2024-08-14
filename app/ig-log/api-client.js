const fetch = require('node-fetch')

class ApiClient {
  constructor (baseUrl) {
    this.baseUrl = baseUrl
  }

  async get (path) {
    const response = await fetch(`${this.baseUrl}/${path}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.statusText}`)
    }

    return response.json()
  }

  async post (path, data) {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Failed to create ${path}: ${response.statusText}`)
    }

    return response.json()
  }

  async patch (path, data) {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Failed to update ${path}: ${response.statusText}`)
    }

    return response.json()
  }
}

module.exports = ApiClient
