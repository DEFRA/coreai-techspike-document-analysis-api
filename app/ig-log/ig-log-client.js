const ApiClient = require('./api-client')

const {
  ProjectService,
  SessionService,
  ThreadService,
  StepService
} = require('./services')

class IgLogClient {
  constructor (config) {
    this.baseUrl = config.baseUrl
    this.apiClient = new ApiClient(config.baseUrl)

    this.projects = new ProjectService(this)
    this.sessions = new SessionService(this)
    this.threads = new ThreadService(this)
    this.steps = new StepService(this)
  }
}

module.exports = IgLogClient
