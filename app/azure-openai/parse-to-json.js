const { ChatOpenAI } = require('@langchain/openai')
const { ChatPromptTemplate } = require('@langchain/core/prompts')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const config = require('../config/azure-openai')

const promptTemplate = `
You analyze product descriptions contained in [productDescription] to export them into a JSON format. I will present you with a product data sheet and describe the individual JSON objects and properties with <<<. You then create only JSON from product data sheet supplied to you at the end.

[productDescription]
{text}
[/productDescription]

>>> Example product:

Product family benefits <<< benefits (string[])
_
Short arc with very high luminance for brighter screen illumination <<< benefits.[*]
_
Constant color temperature of 6,000 K throughout the entire lamp lifetime <<< benefits.[*]

[..]

_
Wide dimming range <<< benefits.[*]
Product family features <<< product_family (object)
_
Color temperature: approx. 6,000 K (Daylight) <<< product_family.temperature = 6000
_
Wattage: 450…10,000 W <<< product_family.watts_min = 450, product_family.watts_max = 10000
_
Very good color rendering index: Ra >
Product datasheet


 
XBO 1000 W/HS OFR <<< name
XBO for cinema projection | Xenon short-arc lamps 450…10,000 W <<< description

[..]

Technical data
Electrical data <<< technical_data (object)
Nominal current
50 A <<< technical_data.nominal_current = 50.00
Current control range
30…55 A <<< technical_data.control_range = 30, technical_data.control_range = 55
Nominal wattage
1000.00 W <<< technical_data.nominal_wattage = 1000.00
Nominal voltage
19.0 V <<< technical_data.nominal_voltage = 19.0
Dimensions & weight <<< dimensions (object)

[..]

Safe Use Instruction
The identification of the Candidate List substance is <<< environmental_information.safe_use (beginning of string)

sufficient to allow safe use of the article. <<< environmental_information.safe_use (end of string)
Declaration No. in SCIP database
22b5c075-11fc-41b0-ad60-dec034d8f30c <<< environmental_information.scip_declaration_number (single string!)
Country specific information

[..]

Shipping carton box

1
410 mm x 184 mm x <<< packaging_unity.length = 410, packaging_unit.width = 184

180 mm <<< packaging_unit.height = 180

[..]

-------------

Provide your JSON output with no other wrapping of text using the following JSON schema:

{{
  "type": "object",
  "properties": {{
    "name": {{
      "type": "string"
    }},
    "description": {{
      "type": "string"
    }},
    "applications": {{
      "type": "array",
      "items": {{
        "type": "string"
      }}
    }},
    "benefits": {{
      "type": "array",
      "items": {{
        "type": "string"
      }}
    }},
    "product_family": {{
      "type": "object",
      "properties": {{
        "temperature": {{
          "type": "number"
        }},
        "watts_min": {{
          "type": "number"
        }},
        "watts_max": {{
          "type": "number"
        }}
      }}
    }},
    "technical_data": {{
      "type": "object",
      "properties": {{
        "nominal_current": {{
          "type": "number"
        }},
        "control_range_min": {{
          "type": "number"
        }},
        "control_range_max": {{
          "type": "number"
        }},
        "nominal_wattage": {{
          "type": "number"
        }},
        "nominal_voltage": {{
          "type": "number"
        }}
      }}
    }},
    "dimensions": {{
      "type": "object",
      "properties": {{
        "diameter": {{
          "type": "number"
        }},
        "length": {{
          "type": "number"
        }},
        "length_base": {{
          "type": "number"
        }},
        "light_center_length": {{
          "type": "number"
        }},
        "electrode_gap": {{
          "type": "number"
        }},
        "weight": {{
          "type": "number"
        }}
      }}
    }},
    "operating_conditions": {{
      "type": "object",
      "properties": {{
        "max_temp": {{
          "type": "string"
        }},
        "lifespan": {{
          "type": "number"
        }},
        "service_lifetime": {{
          "type": "number"
        }}
      }}
    }},
    "logistical_data": {{
      "type": "object",
      "properties": {{
        "product_code": {{
          "type": "string"
        }},
        "product_name": {{
          "type": "string"
        }},
        "packaging_unit": {{
          "type": "object",
          "properties": {{
            "product_code": {{
              "type": "string"
            }},
            "product_name": {{
              "type": "string"
            }},
            "length": {{
              "type": "number"
            }},
            "width": {{
              "type": "number"
            }},
            "height": {{
              "type": "number"
            }},
            "volume": {{
              "type": "number"
            }},
            "weight": {{
              "type": "number"
            }}
          }}
        }}
      }}
    }}
  }}
}}
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
