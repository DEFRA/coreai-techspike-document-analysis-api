const Joi = require('joi')

const schema = Joi.object({
  azureOpenAIEndpoint: Joi.string().required(),
  azureOpenAIApiKey: Joi.string().required(),
  azureOpenAIApiDeploymentName: Joi.string().required(),
  modelName: Joi.string().required()
})

const config = {
  azureOpenAIEndpoint: process.env.OPEN_AI_ENDPOINT,
  azureOpenAIApiKey: process.env.OPEN_AI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.OPEN_AI_DEPLOYMENT_ID,
  modelName: 'gpt-35-turbo'
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The Azure OpenAI config is invalid. ${error.message}`)
}

module.exports = value
