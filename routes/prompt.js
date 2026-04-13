const express = require('express');
const { body } = require('express-validator');
const promptController = require('../controllers/promptController');

const router = express.Router();

const presetRules = [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('project_type').trim().notEmpty().isLength({ max: 50 }),
  body('frontend_stack').isObject(),
  body('backend_stack').isObject(),
  body('output_format').isIn(['agents_md', 'codex', 'chatgpt'])
];

router.get('/', promptController.index);
router.post('/generate', promptController.generate);
router.get('/preset/list', promptController.presetList);
router.get('/preset/:id', promptController.showPreset);
router.post('/preset', presetRules, promptController.storePreset);
router.delete('/preset/:id', promptController.deletePreset);

module.exports = router;
