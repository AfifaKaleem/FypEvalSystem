"use strict";

// middleware/validateEmail.js
var validateEmail = function validateEmail(req, res, next) {
  var emailRegex = /(.*@student\.uol\.edu\.pk$|.*@faculty\.uol\.edu\.pk$|.*@admin\.uol\.edu\.pk$)/;

  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({
      error: 'Invalid email domain'
    });
  }

  next();
};

module.exports = validateEmail;
//# sourceMappingURL=validateEmail.dev.js.map
