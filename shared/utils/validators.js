import { FILE_LIMITS } from './constants.js';

export function validateFileType(file) {
  return FILE_LIMITS.ALLOWED_TYPES.includes(file.type);
}

export function validateFileSize(file) {
  return file.size <= FILE_LIMITS.MAX_FILE_SIZE;
}

export function validateFiles(files) {
  const errors = [];
  for (const file of files) {
    if (!validateFileType(file)) {
      errors.push({ file: file.name, error: `Invalid file type. Allowed: ${FILE_LIMITS.ALLOWED_TYPES.join(', ')}` });
    } else if (!validateFileSize(file)) {
      errors.push({ file: file.name, error: `File too large. Max: ${FILE_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB` });
    }
  }
  return errors;
}
