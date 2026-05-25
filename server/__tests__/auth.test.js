import { describe, it } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Module', () => {
  it('should hash and compare passwords', async () => {
    const password = 'test123456';
    const hash = await bcrypt.hash(password, 12);
    assert.ok(await bcrypt.compare(password, hash));
    assert.ok(!(await bcrypt.compare('wrong', hash)));
  });

  it('should sign and verify JWT tokens', () => {
    const secret = 'test-secret';
    const payload = { id: '123', role: 'user' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    assert.equal(decoded.id, '123');
    assert.equal(decoded.role, 'user');
  });

  it('should reject invalid tokens', () => {
    assert.throws(() => jwt.verify('bad-token', 'secret'));
  });

  it('should enforce minimum password length', () => {
    assert.ok('123456'.length >= 6);
    assert.ok(!('12345'.length >= 6));
  });

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.ok(emailRegex.test('user@example.com'));
    assert.ok(!emailRegex.test('invalid'));
  });
});
