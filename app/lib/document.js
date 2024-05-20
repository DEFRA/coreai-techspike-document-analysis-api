const processPayloadDocument = async (payload) => {
  const chunks = []

  for await (const chunk of payload) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

module.exports = {
  processPayloadDocument
}
