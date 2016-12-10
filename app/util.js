

const _ = require('lodash')
const config = require('config')
const jwt = require('jsonwebtoken')



var token = null
/**
 * verify if token has not expired
 * @param  {[type]}  _token [description]
 * @return {Boolean}        [description]
 */
function isValid(_token) {
  var decoded = jwt.decode(_token, {complete: true});
  var now = Date.now() / 100 - 100
  if(decoded){
    return decoded.payload.exp > now
  }
  return false;
}

var util = _.cloneDeep(require('tc-core-library-js').util(config))
_.assign(util, {
  /**
   * Retrieve valid system user token
   * @param  {[type]} logger [description]
   * @param  {[type]} id     [description]
   * @return {[type]}        [description]
   */
  getSystemUserToken: (logger, id) => {
    if (token && isValid(token)) {
      return Promise.resolve(token)
    }

    id = id || 'system'
    const httpClient = util.getHttpClient({id: id, log: logger})
    const url = `${config.get('identityServiceEndpoint')}authorizations/`
    const formData = `clientId=${config.get('systemUserClientId')}&secret=${encodeURIComponent(config.get('systemUserClientSecret'))}`
    // logger.debug(url, formData)
    return httpClient.post(url, formData,
      {
        timeout: 4000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )
    .then(res => {
      token = res.data.result.content.token
      // console.log('\n\n\nTOKEN:', token)
      return token
    })
  }
})

module.exports = util
