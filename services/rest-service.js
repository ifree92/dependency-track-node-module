/** RestService is a layer of isolation for the rest client
*  it makes life easier in case we want to replace axios with a different
* rest client like jquery, pure node http, ember data etc ..
*/
const axios = require('axios');
const {config} = require('../config');

applyDefaults = () => {
  axios.defaults.baseURL = config.baseUrl;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Accept'] =  'application/json';
  axios.defaults.headers.common['X-Api-Key'] = config.apiKey;
}

rest = async (method, urlSuffix, requestData, queryData) => {
    applyDefaults();

    const response = await axios({ method: method, url: urlSuffix, data: requestData, params: queryData, timeout: 5000 });

    const {data, status}  = response;
    return data;
},

exports.post = (urlSuffix, bodyData) => {
  return rest('post', urlSuffix, bodyData);
},

exports.put = (urlSuffix, bodyData) => {
  return rest('put', urlSuffix, bodyData);
},

exports.delete = (urlSuffix, bodyData) => {
  return rest('delete', urlSuffix, bodyData);
},

exports.get = (urlSuffix, bodyData, queryData) => {
  return rest('get', urlSuffix, bodyData, queryData);
}
