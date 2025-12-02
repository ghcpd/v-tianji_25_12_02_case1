import { validateEmail, validatePhone, validatePassword, validateCreditCard, validatePostalCode } from '../validation';

describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@.com')).toBe(false);
  });

  it('should return false for empty strings', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should return true for valid phone numbers', () => {
    expect(validatePhone('+1234567890')).toBe(true);
    expect(validatePhone('123-456-7890')).toBe(true);
    expect(validatePhone('(123) 456-7890')).toBe(true);
  });

  it('should return false for invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('abc')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should return true for valid passwords', () => {
    expect(validatePassword('Password123')).toBe(true);
    expect(validatePassword('SecurePass1')).toBe(true);
  });

  it('should return false for passwords without uppercase', () => {
    expect(validatePassword('password123')).toBe(false);
  });

  it('should return false for passwords without lowercase', () => {
    expect(validatePassword('PASSWORD123')).toBe(false);
  });

  it('should return false for passwords without numbers', () => {
    expect(validatePassword('PasswordOnly')).toBe(false);
  });

  it('should return false for short passwords', () => {
    expect(validatePassword('Pass1')).toBe(false);
  });
});

describe('validateCreditCard', () => {
  it('should return true for valid credit card numbers', () => {
    expect(validateCreditCard('4532015112830366')).toBe(true);
    expect(validateCreditCard('4532 0151 1283 0366')).toBe(true);
  });

  it('should return false for invalid credit card numbers', () => {
    expect(validateCreditCard('1234567890123456')).toBe(false);
    expect(validateCreditCard('4532015112830367')).toBe(false);
  });
});

describe('validatePostalCode', () => {
  it('should validate US postal codes', () => {
    expect(validatePostalCode('12345', 'US')).toBe(true);
    expect(validatePostalCode('12345-6789', 'US')).toBe(true);
    expect(validatePostalCode('1234', 'US')).toBe(false);
  });

  it('should validate UK postal codes', () => {
    expect(validatePostalCode('SW1A 1AA', 'UK')).toBe(true);
    expect(validatePostalCode('M1 1AE', 'UK')).toBe(true);
  });
});
