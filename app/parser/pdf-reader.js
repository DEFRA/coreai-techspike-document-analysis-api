let PdfReader

const readPDF = async (pdfBuffer) => {
  if (!PdfReader) {
    const module = await import('pdfreader')
    PdfReader = module.PdfReader
  }

  const pdfReader = new PdfReader()

  const text = await new Promise((resolve, reject) => {
    const lines = []
    pdfReader.parseBuffer(pdfBuffer, (err, item) => {
      if (err) {
        console.error('error:', err)
        reject(err)
      } else if (!item) {
        resolve(lines.join('\n'))
      } else if (item.text) {
        lines.push(item.text)
      }
    })
  })

  return text
}

module.exports = {
  readPDF
}
