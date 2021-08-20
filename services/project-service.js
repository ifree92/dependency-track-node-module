const restService = require('./rest-service');
const querystring = require('querystring');

exports.findByName = (projectName) => {
    const urlPath = '/api/v1/project';
    const params = querystring.stringify({
          'name': projectName,
          'excludeInactive': true
    });

    return restService.get(urlPath, params);
}

exports.findByNameAndVersion = (name, version) => {
    const urlPath = '/api/v1/project/lookup';
    return restService.get(urlPath, null, { name, version });
}

exports.deleteByUuid = (projectUuid) => {
  const urlPath = `/api/v1/project/${projectUuid}`;
  return restService.delete(urlPath, {});
}

exports.isBeingProcessed = (token) => {
  const urlPath = `/api/v1/bom/token/${token}`;
  return restService.get(urlPath, {});
}

/**
 * @typedef {Object} CreateProjectOpts
 * @property {string} group
 * @property {string} name
 * @property {string} description
 * @property {string} version
 * @property {string} classifier
 * @property {string} purl
 * @property {string[]} tags
 */

/**
 * @typedef {CreateProjectOpts} UpdateProjectOpts
 * @property {string} uuid
 */

/**
 * Creates a new project
 * @param {CreateProjectOpts} opts
 * @returns {Promise<AxiosResponse<any>>}
 */
exports.createProject = (opts) => {
    const urlPath = '/api/v1/project';
    const body = {
        ...opts,
        tags: opts.tags?.map((name) => ({name})),
    }
    return restService.put(urlPath, body);
}

/**
 * Updates a project
 * @param {UpdateProjectOpts} opts
 * @returns {Promise<AxiosResponse<any>>}
 */
exports.updateProject = (opts) => {
    const urlPath = '/api/v1/project';
    const body = {
        ...opts,
        tags: opts.tags?.map((name) => ({ name })),
    }

    return restService.post(urlPath, body);
}
