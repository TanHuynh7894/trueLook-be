import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const TEMP_FOLDER = 'temp/uploads';

export const imageUploadConfig = () => ({

  storage: diskStorage({

    destination: (req, file, cb) => {

      if (!fs.existsSync(TEMP_FOLDER)) {
        fs.mkdirSync(TEMP_FOLDER, { recursive: true });
      }

      cb(null, TEMP_FOLDER);
    },

    filename: (req, file, cb) => {

      const uniqueName = Date.now() + extname(file.originalname);

      cb(null, uniqueName);
    },

  }),

  fileFilter: (req, file, cb) => {

    const allowedTypes = /jpg|jpeg|png|webp/;
    const ext = extname(file.originalname).toLowerCase();
    const mime = file.mimetype.startsWith('image/');

    if (!allowedTypes.test(ext) || !mime) {
      return cb(new Error('Only image files are allowed'), false);
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

});