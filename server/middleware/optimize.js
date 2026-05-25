import sharp from 'sharp';

export async function compressUpload(req, res, next) {
  if (!req.file) return next();

  try {
    const compressed = await sharp(req.file.path)
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    await sharp(compressed).toFile(req.file.path.replace(/\.\w+$/, '.jpg'));
    req.file.path = req.file.path.replace(/\.\w+$/, '.jpg');
    req.file.filename = req.file.filename.replace(/\.\w+$/, '.jpg');
    req.file.mimetype = 'image/jpeg';
  } catch {
    // fall through with original file
  }

  next();
}

export async function compressBuffer(buffer, format = 'jpeg', quality = 85) {
  try {
    const pipeline = sharp(buffer);
    if (format === 'jpeg') return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    if (format === 'webp') return pipeline.webp({ quality }).toBuffer();
    return pipeline.png({ compressionLevel: 8 }).toBuffer();
  } catch {
    return buffer;
  }
}
