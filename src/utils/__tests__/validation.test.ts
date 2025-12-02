import { validateEmail, validatePhone, validatePassword, validateUrl, validateCreditCard, sanitizeInput, validatePostalCode } from '../validation';

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

  it('should handle emails with multiple dots', () => {
    expect(validateEmail('user.name.test@example.co.uk')).toBe(true);
  });

  it('should reject emails with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false);
    expect(validateEmail('user@ example.com')).toBe(false);
  });

  it('should handle single character local part', () => {
    expect(validateEmail('a@example.com')).toBe(true);
  });

  it('should reject multiple @ symbols', () => {
    expect(validateEmail('user@@example.com')).toBe(false);
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

  it('should handle phone with spaces', () => {
    expect(validatePhone('123 456 7890')).toBe(true);
  });

  it('should handle phone with plus sign', () => {
    expect(validatePhone('+1 234 567 8900')).toBe(true);
  });

  it('should require at least 10 characters', () => {
    expect(validatePhone('1234567')).toBe(false);
    expect(validatePhone('12345678901')).toBe(true);
  });

  it('should handle phone with plus sign', () => {
    expect(validatePhone('+1 234 567 8900')).toBe(true);
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

  it('should accept passwords with exactly 8 characters', () => {
    expect(validatePassword('Passw0rd')).toBe(true);
  });

  it('should accept passwords longer than 8 characters', () => {
    expect(validatePassword('VeryLongPassword1')).toBe(true);
  });

  it('should require at least one uppercase letter', () => {
    expect(validatePassword('password1')).toBe(false);
    expect(validatePassword('Password1')).toBe(true);
  });

  it('should require at least one lowercase letter', () => {
    expect(validatePassword('PASSWORD1')).toBe(false);
    expect(validatePassword('PAssword1')).toBe(true);
  });

  it('should require at least one digit', () => {
    expect(validatePassword('PasswordTest')).toBe(false);
    expect(validatePassword('PasswordTest1')).toBe(true);
  });

  it('should handle special characters in password', () => {
    expect(validatePassword('P@ssw0rd!Test')).toBe(true);
  });
});

describe('validateUrl', () => {
  it('should return true for valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://www.example.com')).toBe(true);
    expect(validateUrl('https://example.com/path')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(validateUrl('not a url')).toBe(false);
    expect(validateUrl('example.com')).toBe(false);
  });

  it('should handle URLs with query parameters', () => {
    expect(validateUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should handle URLs with fragments', () => {
    expect(validateUrl('https://example.com/path#section')).toBe(true);
  });

  it('should handle URLs with ports', () => {
    expect(validateUrl('https://example.com:8080/path')).toBe(true);
  });

  it('should handle file protocol', () => {
    expect(validateUrl('file:///path/to/file')).toBe(true);
  });

  it('should reject empty strings', () => {
    expect(validateUrl('')).toBe(false);
  });

  it('should reject URLs without protocol', () => {
    expect(validateUrl('www.example.com')).toBe(false);
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

  it('should handle cards with spaces', () => {
    expect(validateCreditCard('4532 0151 1283 0366')).toBe(true);
  });

  it('should handle cards with spaces', () => {
    expect(validateCreditCard('4532 0151 1283 0366')).toBe(true);
  });

  it('should reject cards that are too short', () => {
    expect(validateCreditCard('123456789012')).toBe(false);
  });

  it('should reject cards that are too long', () => {
    expect(validateCreditCard('12345678901234567890')).toBe(false);
  });

  it('should reject non-numeric cards', () => {
    expect(validateCreditCard('4532-XXXX-XXXX-0366')).toBe(false);
  });

  it('should validate 16-digit card numbers', () => {
    expect(validateCreditCard('4532015112830366')).toBe(true);
  });

  it('should use Luhn algorithm for validation', () => {
    // Valid Mastercard test number
    expect(validateCreditCard('5105105105105100')).toBe(true);
  });
});

describe('sanitizeInput', () => {
  it('should remove angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world');
  });

  it('should remove both < and > characters', () => {
    expect(sanitizeInput('<div>content</div>')).toBe('divcontent/div');
  });

  it('should handle input without special characters', () => {
    expect(sanitizeInput('normal text')).toBe('normal text');
  });

  it('should handle empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should handle only whitespace', () => {
    expect(sanitizeInput('   ')).toBe('');
  });

  it('should handle multiple angle brackets', () => {
    expect(sanitizeInput('<<<test>>>')).toBe('test');
  });

  it('should preserve other special characters', () => {
    expect(sanitizeInput('test@example.com')).toBe('test@example.com');
  });

  it('should handle mixed content', () => {
    expect(sanitizeInput('  <h1>Title</h1>  ')).toBe('h1Title/h1');
  });
});

describe('validatePostalCode', () => {
  it('should validate US postal codes', () => {
    expect(validatePostalCode('12345', 'US')).toBe(true);
    expect(validatePostalCode('12345-6789', 'US')).toBe(true);
  });

  it('should reject invalid US postal codes', () => {
    expect(validatePostalCode('1234', 'US')).toBe(false);
    expect(validatePostalCode('123456', 'US')).toBe(false);
  });

  it('should validate UK postal codes', () => {
    expect(validatePostalCode('SW1A 1AA', 'UK')).toBe(true);
    expect(validatePostalCode('M1 1AE', 'UK')).toBe(true);
  });

  it('should handle UK postal codes without space', () => {
    expect(validatePostalCode('SW1A1AA', 'UK')).toBe(true);
  });

  it('should validate Canadian postal codes', () => {
    expect(validatePostalCode('K1A 0B1', 'CA')).toBe(true);
    expect(validatePostalCode('M5V 3A8', 'CA')).toBe(true);
  });

  it('should handle Canadian postal codes without space', () => {
    expect(validatePostalCode('K1A0B1', 'CA')).toBe(true);
  });

  it('should reject invalid postal codes for country', () => {
    expect(validatePostalCode('SW1A 1AA', 'US')).toBe(false);
    expect(validatePostalCode('12345', 'UK')).toBe(false);
  });

  it('should return false for unknown country', () => {
    expect(validatePostalCode('12345', 'FR')).toBe(false);
  });

  it('should handle edge cases for US', () => {
    expect(validatePostalCode('00000', 'US')).toBe(true);
    expect(validatePostalCode('99999-9999', 'US')).toBe(true);
  });

  it('should be case insensitive for UK', () => {
    expect(validatePostalCode('sw1a 1aa', 'UK')).toBe(true);
  });
});
