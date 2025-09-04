import express from 'express';
import upload from '../middlewares/upload.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', [protect, upload.single('file')], (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Vui lòng tải lên một tệp' });
  }
  const filePath = req.file.path.replace(/\\/g, '/');
  res.status(200).send({
    message: 'Tải lên tệp thành công',
    filePath: `/${filePath}`,
  });
});

export default router;