const readInstalled = require('read-installed');
const parsePackageJsonName = require('parse-packagejson-name');
const ssri = require('ssri');
const fs = require('fs');
const packageURL = require('packageurl-js');
const bomService = require('./services/bom-service');
const projectService = require('./services/project-service');
const findingsService = require('./services/findings-service');
const metricsService = require('./services/metrics-service');
const {config} = require('./config');
const {showProgressBarAnimation} = require('./utils/misc-utils')
const {isEmpty, isNotEmpty} = require('./utils/string-utils')

const filterByProjectVersion = (projects) => {
  const {projectVersion} = config;

  if (isEmpty(projects)) {
    return null;
  }

  return projects.find(p => p.version == projectVersion);
}

const loadFile = (bomFilePath) => {
  try {
    return fs.readFileSync(bomFilePath, null, 'r');
  } catch (ex) {
    return null;
  }
}

checkVulnerability = (level, response) => {
  const {findingsThreshold} = config;
  const threshold = findingsThreshold[level];

  if (threshold >= 0 && response[level] >= threshold) {
    throw new Error(`${response[level]} ${level} vulnerabilities found`);
  }
}

const VULNERABILITY_LEVELS = ['critical', 'high', 'medium', 'low'];
exports.metrics = async(callback) => {
  const {projectName, projectVersion, findingsThreshold} = config
  const projects = await projectService.findByName(projectName);
  const project = filterByProjectVersion(projects);

  if (isEmpty(project)) {
    throw new Error(`Project [${projectName} - ${projectVersion}] not found`);
  }

  const response = await metricsService.findByProjectUuid(project.uuid);
  for (key in VULNERABILITY_LEVELS) {
    checkVulnerability(VULNERABILITY_LEVELS[key], response);
  }

  return response;
}

exports.findings = async(callback) => {
  const {projectName, projectVersion} = config
  const projects = await projectService.findByName(projectName);
  const project = filterByProjectVersion(projects);

  if (isEmpty(project)) {
    throw new Error(`Project [${projectName} - ${projectVersion}] not found`);
  }

  return await findingsService.findByProjectUuid(project.uuid);
}

/**
* uploadbom will orchestrate all the calls required to upload a bom file to
* Dependency Track
*/
exports.uploadbom = async() => {
  const { bomFilepath, projectName, projectVersion, waitUntilBomProcessingComplete, failOnError, projectUUID } = config

  if (!fs.existsSync(bomFilepath)) {
      throw new Error('Bom file not found.');
  }

  const bomFileBuffer = loadFile(bomFilepath);

  if (isEmpty(bomFileBuffer)) {
     throw new Error('Bom could not be loaded.');
  }

  const base64BomFile = bomFileBuffer.toString('base64');
  let response;
  if (projectUUID) {
    response = bomService.uploadByProjectUUID(projectUUID, base64BomFile);
  } else {
    response = await bomService.upload(projectName, projectVersion, base64BomFile);
  }

  const {token} = response;

  let isBeingProcessed = true;
  while (waitUntilBomProcessingComplete && isBeingProcessed) {
      const bomProcessedResponse = await bomService.isBeingProcessed(token);
      isBeingProcessed = bomProcessedResponse.processing;
      await showProgressBarAnimation("Processing BOM:", 5000);
  }

  return response;
}

exports.deleteProject = async() => {
  const {projectName, projectVersion} = config
  const projects = await projectService.findByName(projectName);
  const project = filterByProjectVersion(projects);

  if (isEmpty(project)) {
    throw new Error(`Project [${projectName} - ${projectVersion}] not found`);
  }

  return await projectService.deleteByUuid(project.uuid);
}

/**
 * This function creates a project if "projectUUID" is not provided, otherwise it updates the project
 * @returns {Promise<string>}
 */
exports.createProject = async () => {
  const {
    projectPURL,
    projectVersion,
    projectName,
    projectGroup,
    projectDescription,
    projectClassifier,
    projectTags,
  } = config;

  let projectUUID = config.projectUUID;
  const projectTagList = projectTags?.split(',').map((tag) => tag.trim()).filter((tag) => !!tag);

  if (!projectUUID) {
    try {
      const data = await projectService.findByNameAndVersion(projectName, projectVersion);
      projectUUID = data.uuid;
    } catch (e) {}
  }

  if (projectUUID) {
    await projectService.updateProject({
      uuid: projectUUID,
      group: projectGroup,
      name: projectName,
      description: projectDescription,
      version: projectVersion,
      classifier: projectClassifier,
      purl: projectPURL,
      tags: projectTagList,
    });
  } else {
    const createdProject = await projectService.createProject({
      group: projectGroup,
      name: projectName,
      description: projectDescription,
      version: projectVersion,
      classifier: projectClassifier,
      purl: projectPURL,
      tags: projectTagList,
    });
    projectUUID = createdProject.uuid;
  }

  return projectUUID;
}
