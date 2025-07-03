// const { body, validationResult } = require('express-validator');

// const validatePost = [
//   body('content').notEmpty().withMessage('Content is required'),
//   body('author')
//     .matches(/.*@(student\.uol\.edu\.pk|cs\.uol\.edu\.pk|admin\.cs\.uol\.edu\.pk)$/)
//     .withMessage('Invalid author email format'),
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   },
// ];

// // const validateReply = [
// //   body('reply').notEmpty().withMessage('Reply is required'),
// //   body('author')
// //     .matches(/.*@(student\.uol\.edu\.pk|cs\.uol\.edu\.pk|admin\.cs\.uol\.edu\.pk)$/)
// //     .withMessage('Invalid author'),
// //   body('content')
// //     .isMongoId()
// //     .withMessage('Invalid post ID'),
// //   (req, res, next) => {
// //     const errors = validationResult(req);
// //     if (!errors.isEmpty()) {
// //       return res.status(400).json({ errors: errors.array() });
// //     }
// //     next();
// //   },
// // ];

// module.exports = {
//   validatePost,
//   // validateReply,
// };
