exports.config = {
  apiKey: '',
  baseUrl: '',

  projectUUID: '',
  projectAutoCreate: true,
  projectName: '',
  projectVersion: '',
  projectClassifier: undefined, // string
  projectDescription: undefined, // string
  projectTags: undefined, // string, example: tag1,tag2,tag3
  projectGroup: undefined, // string
  projectPURL: undefined, // string

  failOnError: true,
  bomFilepath: '.',
  waitUntilBomProcessingComplete: false,
  findingsThreshold: {
    critical: -1,
    high: -1,
    medium: -1,
    low: -1
  },
}
