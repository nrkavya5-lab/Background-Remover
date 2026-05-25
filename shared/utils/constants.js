export const IMAGE_FORMATS = {
  PNG: 'png',
  JPEG: 'jpeg',
  WEBP: 'webp',
};

export const QUALITY_PRESETS = {
  LOW: { value: 70, label: 'Low', desc: 'Smaller file, lower quality' },
  MEDIUM: { value: 85, label: 'Medium', desc: 'Balanced size and quality' },
  HIGH: { value: 95, label: 'HD', desc: 'High quality, larger file' },
  ORIGINAL: { value: 100, label: 'Ultra HD', desc: 'Best quality, largest file' },
};

export const FILE_LIMITS = {
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  MAX_FILES_BATCH: 20,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

export const API_ENDPOINTS = {
  UPLOAD: '/api/upload',
  REMOVE_BG: '/api/remove-bg',
  REPLACE_BG: '/api/replace-bg',
  EDIT: '/api/edit',
  DOWNLOAD: '/api/download',
  BATCH: '/api/batch',
  AUTH: '/api/auth',
  ADMIN: '/api/admin',
};

export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#8B5CF6',
  DARK: '#1F2937',
  LIGHT: '#F9FAFB',
};
