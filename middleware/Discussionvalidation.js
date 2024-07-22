const { body, validationResult } = require('express-validator');


const validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('author').matches(/.*@(student\.uol\.edu\.pk|faculty\.uol\.edu\.pk|admin\.uol\.edu\.pk)$/).withMessage('Invalid author email format'),
  body('comments').optional().isArray().withMessage('Comments must be an array'),
  body('comments.*').optional().isMongoId().withMessage('Invalid comment ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateComment = [
    body('content').notEmpty().withMessage('Content is required'),
    body('author').matches(/.*@(student\.uol\.edu\.pk|faculty\.uol\.edu\.pk|admin\.uol\.edu\.pk)$/).withMessage('Invalid author'),
    body('post').isMongoId().withMessage('Invalid post ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = {
    validatePost,
    validateComment,
};
