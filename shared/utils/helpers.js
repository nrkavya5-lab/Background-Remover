export function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export function generateFileName(originalName, suffix = '') {
  const ext = originalName.split('.').pop();
  const name = originalName.replace(`.${ext}`, '');
  return `${name}${suffix ? `-${suffix}` : ''}.${ext}`;
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
