const endpoint = 'project'

class ProjectService {
  constructor (client) {
    this.client = client
  }

  async list () {
    return this.client.apiClient.get(endpoint)
  }

  async get (id) {
    return this.client.apiClient.get(`${endpoint}/${id}`)
  }

  async create (project) {
    return this.client.apiClient.post(endpoint, project)
  }

  async update (project) {
    return this.client.apiClient.patch(`/${endpoint}/${project.id}`, project)
  }
}

module.exports = ProjectService
