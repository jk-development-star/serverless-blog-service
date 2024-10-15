const validationError = (error) => {
    let validationErrorMessages = {};
    if (error.errors) {
      for (const field in error.errors) {
        validationErrorMessages[field] = error.errors[field].message
      }
    }
    return validationErrorMessages;
  };


module.exports = validationError
