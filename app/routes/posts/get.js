const config = require('config');
const util = require('tc-core-library-js').util(config);
const Discourse = require('../../services/discourse');
const errors = require('common-errors');
const Adapter = require('../../services/adapter');

/**
 * Get posts from Discourse
 * @param {Object} db sequelize db with models loaded
 * @return {Object} response
 */
module.exports = db => (req, resp, next) => {
  const logger = req.log;
  const discourseClient = Discourse(logger);
  const adapter = new Adapter(logger, db);

  return discourseClient.getPost(req.authUser.userId.toString(), req.params.postId)
      .then((response) => {
        logger.info('Fetched post from discourse', response.data);
        return adapter.adaptPost(response.data);
      })
      .then(post => resp.status(200).send(util.wrapResponse(req.id, post))).catch((error) => {
        logger.error(error);
        next(new errors.HttpStatusError(error.response.status, 'Error fetching post'));
      });
};
