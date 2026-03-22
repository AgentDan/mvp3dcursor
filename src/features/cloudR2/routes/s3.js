const express = require('express');
const multer = require('multer');
const s3Controller = require('../controllers/s3Controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/objects', s3Controller.list);
router.post('/upload', upload.single('file'), s3Controller.upload);
router.get('/download/:key', s3Controller.download);
router.get('/model/:key', s3Controller.stream);
router.delete('/object/:key', s3Controller.remove);
router.get('/:bucket', s3Controller.list);

module.exports = router;
