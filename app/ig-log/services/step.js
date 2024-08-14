const endpoint = 'step'

class StepService {
  constructor (client) {
    this.client = client
  }

  async get (id) {
    return this.client.apiClient.get(`${endpoint}/${id}`)
  }

  async create (step) {
    return this.client.apiClient.post(endpoint, step)
  }

  async update (step) {
    return this.client.apiClient.patch(`/${endpoint}/${step.id}`, step)
  }
}

module.exports = StepService
