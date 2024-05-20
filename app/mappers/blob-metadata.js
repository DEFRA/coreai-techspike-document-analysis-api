const blob = {
  fileName: 'file_name',
  uploadedBy: 'uploaded_by',
  documentType: 'document_type'
}

const map = (metadata, lookup) => {
  const obj = {}

  for (const key in metadata) {
    obj[lookup[key]] = metadata[key]
  }

  return obj
}

const mapMetadataToBlob = (metadata) => map(metadata, blob)

module.exports = {
  mapMetadataToBlob
}
