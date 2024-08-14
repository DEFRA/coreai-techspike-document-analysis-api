const { ChatOpenAI } = require('@langchain/openai')
const { ChatPromptTemplate } = require('@langchain/core/prompts')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const config = require('../config/azure-openai')

const promptTemplate = `
You analyze packing list files contained in [packingList] to export them into a JSON format. I will present you with a packing list and describe the individual JSON objects and properties with <<<. You then create only JSON from the [packingList].

[packingList]
{text}
[/packingList]

>>> Example packing list array:

Category <<< packingList.category
Part Number <<< packingList.partNumber
Part Description <<< packingList.partDescription
Tariff Code <<< packingList.tariffCode
Packaging <<< packingList.packing
Type <<< packingList.type
Unit Qty <<< packingList.unitQty
Packages <<< packingList.packages
Net Weight <<< packingList.netWeight
Gross Weight <<< packingList.grossWeight

F <<< packingList.category.value
87465 <<< packingList.partNumber.value
ILU 12PK HALLOUM FRIES <<< packingList.partDescription.value
2106909869 <<< packingList.tariffCode.value
CT <<< packingList.packing.value
12 <<< packingList.unitQty.value
1 <<< packingList.packages.value
2.793000 <<< packingList.netWeight.value
2.940000 <<< packingList.grossWeight.value

[..]
`

const callOpenAi = async (text) => {
  const model = new ChatOpenAI({
    azureOpenAIApiVersion: '2023-09-15-preview',
    azureOpenAIApiKey: config.azureOpenAIApiKey,
    azureOpenAIApiDeploymentName: config.azureOpenAIApiDeploymentName,
    azureOpenAIApiInstanceName: 'adpaipocuksoai-prototyping'
  })
  const outputParser = new StringOutputParser()

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', promptTemplate],
    ['human', '{text}']
  ])
  const chain = prompt.pipe(model).pipe(outputParser)

  return chain.invoke({
    text
  })
}

module.exports = {
  callOpenAi
}
