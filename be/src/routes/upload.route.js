import express from 'express';
import upload from '../middlewares/upload.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', [protect, upload.array('images', 10)], (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'Vui lòng tải lên ít nhất một tệp' });
  }
  const fileUrls = req.files.map(file => file.path); // 'path' is now the Cloudinary URL
  res.status(200).send({
    message: 'Tải lên tệp thành công',
    fileUrls: fileUrls,
  });
});

export default router;