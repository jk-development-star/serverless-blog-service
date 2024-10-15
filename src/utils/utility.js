const getAuthDetails = async (event) => {
  try {
    if (event.requestContext.authorizer) {
      const userId = event.requestContext.authorizer.userId;
      const token = event.requestContext.authorizer.token;
      const role = event.requestContext.authorizer.role;

      return { userId, token, role };
    }
  } catch (error) {
    return error.message;
  }
};
module.exports = getAuthDetails;
