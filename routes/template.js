const path = require('path');
const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const templateController = require('../controllers/templateController');

const router = express.Router();
const uploadRoot = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads/templates');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadRoot);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^\w.가-힣-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const allowedExtensions = ['.zip', '.gz', '.md', '.json'];
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const fileName = file.originalname.toLowerCase();
    const isTarGz = fileName.endsWith('.tar.gz');
    const isAllowed = allowedExtensions.includes(path.extname(fileName)) || isTarGz;

    cb(isAllowed ? null : new Error('허용되지 않는 파일 형식입니다.'), isAllowed);
  }
});

const thumbnailUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const fileName = file.originalname.toLowerCase();
    const isAllowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(path.extname(fileName));

    cb(isAllowed ? null : new Error('허용되지 않는 이미지 형식입니다.'), isAllowed);
  }
});

const storeRules = [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('project_type').trim().notEmpty().isLength({ max: 50 }),
  body('version').trim().notEmpty().isLength({ max: 20 }),
  body('file_path').trim().notEmpty(),
  body('file_name').trim().notEmpty(),
  body('thumbnail_path').optional({ checkFalsy: true }).trim(),
  body('thumbnail_name').optional({ checkFalsy: true }).trim()
];

const updateRules = [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('project_type').trim().notEmpty().isLength({ max: 50 }),
  body('version').trim().notEmpty().isLength({ max: 20 }),
  body('thumbnail_path').optional({ checkFalsy: true }).trim(),
  body('thumbnail_name').optional({ checkFalsy: true }).trim()
];

router.get('/', templateController.index);
router.get('/create', templateController.create);
router.get('/list', templateController.list);
router.post('/upload', upload.single('file'), templateController.upload);
router.post('/upload-thumbnail', thumbnailUpload.single('file'), templateController.uploadThumbnail);
router.post('/', upload.none(), storeRules, templateController.store);
router.get('/:id/edit', templateController.edit);
router.get('/:id', templateController.detail);
router.put('/:id', upload.none(), updateRules, templateController.update);
router.get('/:id/download', templateController.download);
router.delete('/:id', templateController.remove);

module.exports = router;
