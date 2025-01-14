const restService = require('./rest-service');

exports.uploadByProjectUUID = (projectUuid, base64BomFile) => {
    const urlPath = '/api/v1/bom';
    const body = {
      'project': projectUuid,
      'bom': base64BomFile
    }

    return restService.put(urlPath, body);
}

exports.upload = (projectName, projectVersion, base64BomFile) => {
    const urlPath = '/api/v1/bom';
    const body = {
      'projectName': projectName,
      'projectVersion': projectVersion,
      'autoCreate': true,
      'bom': base64BomFile
    }

    return restService.put(urlPath, body);
}

exports.isBeingProcessed = (token) => {
  const urlPath = '/api/v1/bom/token/' + token;
  return restService.get(urlPath, {});
}
