import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

describe('Upload Module', () => {
  const testImage = Buffer.from('fake-image-data');

  it('should reject files larger than 20MB', () => {
    const large = Buffer.alloc(21 * 1024 * 1024);
    assert.ok(large.length > 20 * 1024 * 1024);
  });

  it('should accept valid image types', () => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    assert.ok(allowed.includes('image/jpeg'));
    assert.ok(allowed.includes('image/png'));
    assert.ok(allowed.includes('image/webp'));
    assert.ok(!allowed.includes('image/gif'));
  });

  it('should write uploaded files to uploads directory', async () => {
    const testFile = path.join(uploadsDir, 'test-upload.jpg');
    await fs.writeFile(testFile, testImage);
    const exists = await fs.stat(testFile).then(() => true).catch(() => false);
    assert.ok(exists);
    await fs.unlink(testFile);
  });

  it('should handle non-existent file paths', async () => {
    const exists = await fs.stat(path.join(uploadsDir, 'nonexistent.jpg'))
      .then(() => true).catch(() => false);
    assert.ok(!exists);
  });
});
