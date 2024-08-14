const endpoint = 'session'

class SessionService {
  constructor (client) {
    this.client = client
  }

  async get (id) {
    return this.client.apiClient.get(`${endpoint}/${id}`)
  }

  async create (session) {
    return this.client.apiClient.post(endpoint, session)
  }

  async update (session) {
    return this.client.apiClient.patch(`/${endpoint}/${session.id}`, session)
  }
}

module.exports = SessionService
