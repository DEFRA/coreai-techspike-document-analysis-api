const endpoint = 'thread'

class ThreadService {
  constructor (client) {
    this.client = client
  }

  async get (id) {
    return this.client.apiClient.get(`${endpoint}/${id}`)
  }

  async create (thread) {
    return this.client.apiClient.post(endpoint, thread)
  }

  async update (thread) {
    return this.client.apiClient.patch(`/${endpoint}/${thread.id}`, thread)
  }
}

module.exports = ThreadService
