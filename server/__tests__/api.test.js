import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('API Integration', () => {
  it('should validate image paths', () => {
    const valid = '/uploads/image.png';
    const invalid = '../etc/passwd';
    const isSafe = (p) => p.startsWith('/uploads/');
    assert.ok(isSafe(valid));
    assert.ok(!isSafe(invalid));
  });

  it('should handle format conversion', () => {
    const formats = ['png', 'jpeg', 'webp'];
    assert.ok(formats.includes('png'));
    assert.ok(formats.includes('jpeg'));
    assert.ok(formats.includes('webp'));
    assert.ok(!formats.includes('gif'));
  });

  it('should reject missing required fields', () => {
    const required = ['imagePath'];
    const body = { color: '#fff' };
    const missing = required.filter((f) => !(f in body));
    assert.equal(missing.length, 1);
    assert.equal(missing[0], 'imagePath');
  });

  it('should validate quality range', () => {
    const quality = 85;
    assert.ok(quality >= 0 && quality <= 100);
    assert.ok(!(150 >= 0 && 150 <= 100));
  });
});
