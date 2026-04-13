const express = require('express');
const promptRouter = require('./prompt');
const templateRouter = require('./template');

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/prompt');
});

router.use('/prompt', promptRouter);
router.use('/template', templateRouter);

module.exports = router;
