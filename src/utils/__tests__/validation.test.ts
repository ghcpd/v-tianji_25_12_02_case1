import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateUrl,
  validateCreditCard,
  sanitizeInput,
  validatePostalCode,
} from '../validation';

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

  it('should handle complex valid emails', () => {
    expect(validateEmail('first.last@example.com')).toBe(true);
    expect(validateEmail('email@subdomain.example.com')).toBe(true);
    expect(validateEmail('firstname+lastname@example.com')).toBe(true);
    expect(validateEmail('1234567890@example.com')).toBe(true);
  });

  it('should reject emails with spaces', () => {
    expect(validateEmail('email @example.com')).toBe(false);
    expect(validateEmail('email@ example.com')).toBe(false);
  });

  it('should reject emails without domain', () => {
    expect(validateEmail('email@')).toBe(false);
    expect(validateEmail('email@domain')).toBe(false);
  });

  it('should reject emails with multiple @ symbols', () => {
    expect(validateEmail('email@@example.com')).toBe(false);
    expect(validateEmail('email@domain@example.com')).toBe(false);
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

  it('should handle international formats', () => {
    expect(validatePhone('+1 (555) 123-4567')).toBe(true);
    expect(validatePhone('+44 20 7123 4567')).toBe(true);
    expect(validatePhone('+86 138 0000 0000')).toBe(true);
  });

  it('should accept various separators', () => {
    expect(validatePhone('123 456 7890')).toBe(true);
    expect(validatePhone('123-456-7890')).toBe(true);
    expect(validatePhone('(123)456-7890')).toBe(true);
  });

  it('should handle numbers without separators', () => {
    expect(validatePhone('1234567890')).toBe(true);
    expect(validatePhone('12345678901')).toBe(true);
  });

  it('should reject very short numbers', () => {
    expect(validatePhone('123456789')).toBe(false);
    expect(validatePhone('12345')).toBe(false);
  });

  it('should handle empty string', () => {
    expect(validatePhone('')).toBe(false);
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
    expect(validatePassword('Pa1')).toBe(false);
  });

  it('should accept exactly 8 characters with all requirements', () => {
    expect(validatePassword('Passwor1')).toBe(true);
    expect(validatePassword('Test1234')).toBe(true);
  });

  it('should accept long passwords', () => {
    expect(validatePassword('VeryLongPassword123456789')).toBe(true);
  });

  it('should handle special characters', () => {
    expect(validatePassword('Password1!')).toBe(true);
    expect(validatePassword('P@ssw0rd')).toBe(true);
  });

  it('should reject passwords with only numbers', () => {
    expect(validatePassword('12345678')).toBe(false);
  });

  it('should reject empty passwords', () => {
    expect(validatePassword('')).toBe(false);
  });
});

describe('validateUrl', () => {
  it('should return true for valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://example.com')).toBe(true);
    expect(validateUrl('https://www.example.com')).toBe(true);
  });

  it('should return true for URLs with paths', () => {
    expect(validateUrl('https://example.com/path')).toBe(true);
    expect(validateUrl('https://example.com/path/to/page')).toBe(true);
  });

  it('should return true for URLs with query parameters', () => {
    expect(validateUrl('https://example.com?query=value')).toBe(true);
    expect(validateUrl('https://example.com?q=1&p=2')).toBe(true);
  });

  it('should return true for URLs with hash', () => {
    expect(validateUrl('https://example.com#section')).toBe(true);
    expect(validateUrl('https://example.com/page#top')).toBe(true);
  });

  it('should return true for URLs with port', () => {
    expect(validateUrl('https://example.com:8080')).toBe(true);
    expect(validateUrl('http://localhost:3000')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(validateUrl('not a url')).toBe(false);
    expect(validateUrl('example.com')).toBe(false);
    expect(validateUrl('')).toBe(false);
  });

  it('should return false for URLs without protocol', () => {
    expect(validateUrl('www.example.com')).toBe(false);
    expect(validateUrl('//example.com')).toBe(false);
  });

  it('should handle ftp and other protocols', () => {
    expect(validateUrl('ftp://example.com')).toBe(true);
    expect(validateUrl('file:///path/to/file')).toBe(true);
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

  it('should validate different card types', () => {
    expect(validateCreditCard('5425233430109903')).toBe(true); // Mastercard
    expect(validateCreditCard('374245455400126')).toBe(true); // Amex
    expect(validateCreditCard('6011000991001201')).toBe(true); // Discover
  });

  it('should handle cards with spaces', () => {
    expect(validateCreditCard('5425 2334 3010 9903')).toBe(true);
    expect(validateCreditCard('3742 454554 00126')).toBe(true);
  });

  it('should reject cards with letters', () => {
    expect(validateCreditCard('453201511283036A')).toBe(false);
    expect(validateCreditCard('ABCD EFGH IJKL MNOP')).toBe(false);
  });

  it('should reject cards that are too short', () => {
    expect(validateCreditCard('123456789012')).toBe(false);
  });

  it('should reject cards that are too long', () => {
    expect(validateCreditCard('12345678901234567890')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(validateCreditCard('')).toBe(false);
  });

  it('should reject cards with invalid Luhn checksum', () => {
    expect(validateCreditCard('4532015112830360')).toBe(false);
    expect(validateCreditCard('4532015112830361')).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('should remove angle brackets', () => {
    expect(sanitizeInput('Hello <script>alert("xss")</script>')).toBe('Hello scriptalert("xss")/script');
    expect(sanitizeInput('<div>content</div>')).toBe('divcontent/div');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
    expect(sanitizeInput('  test  ')).toBe('test');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should handle string without special characters', () => {
    expect(sanitizeInput('normal text')).toBe('normal text');
  });

  it('should remove multiple angle brackets', () => {
    expect(sanitizeInput('<<test>>')).toBe('test');
    expect(sanitizeInput('<<<>>>')).toBe('');
  });

  it('should preserve other special characters', () => {
    expect(sanitizeInput('test@example.com')).toBe('test@example.com');
    expect(sanitizeInput('price: $19.99')).toBe('price: $19.99');
  });

  it('should handle mixed content', () => {
    expect(sanitizeInput('  <p>Hello</p> World  ')).toBe('pHello/p World');
  });
});

describe('validatePostalCode', () => {
  describe('US Postal Codes', () => {
    it('should validate US postal codes', () => {
      expect(validatePostalCode('12345', 'US')).toBe(true);
      expect(validatePostalCode('12345-6789', 'US')).toBe(true);
      expect(validatePostalCode('1234', 'US')).toBe(false);
    });

    it('should validate 5-digit ZIP codes', () => {
      expect(validatePostalCode('90210', 'US')).toBe(true);
      expect(validatePostalCode('00001', 'US')).toBe(true);
      expect(validatePostalCode('99999', 'US')).toBe(true);
    });

    it('should validate ZIP+4 format', () => {
      expect(validatePostalCode('12345-6789', 'US')).toBe(true);
      expect(validatePostalCode('90210-1234', 'US')).toBe(true);
    });

    it('should reject invalid US postal codes', () => {
      expect(validatePostalCode('123', 'US')).toBe(false);
      expect(validatePostalCode('ABCDE', 'US')).toBe(false);
      expect(validatePostalCode('12345-678', 'US')).toBe(false);
    });
  });

  describe('UK Postal Codes', () => {
    it('should validate UK postal codes', () => {
      expect(validatePostalCode('SW1A 1AA', 'UK')).toBe(true);
      expect(validatePostalCode('M1 1AE', 'UK')).toBe(true);
    });

    it('should validate various UK formats', () => {
      expect(validatePostalCode('EC1A 1BB', 'UK')).toBe(true);
      expect(validatePostalCode('W1A 0AX', 'UK')).toBe(true);
      expect(validatePostalCode('CR2 6XH', 'UK')).toBe(true);
    });

    it('should validate UK codes without space', () => {
      expect(validatePostalCode('SW1A1AA', 'UK')).toBe(true);
      expect(validatePostalCode('M11AE', 'UK')).toBe(true);
    });

    it('should be case insensitive for UK codes', () => {
      expect(validatePostalCode('sw1a 1aa', 'UK')).toBe(true);
      expect(validatePostalCode('m1 1ae', 'UK')).toBe(true);
    });

    it('should reject invalid UK postal codes', () => {
      expect(validatePostalCode('12345', 'UK')).toBe(false);
      expect(validatePostalCode('AAAA AAA', 'UK')).toBe(false);
    });
  });

  describe('CA Postal Codes', () => {
    it('should validate Canadian postal codes', () => {
      expect(validatePostalCode('K1A 0B1', 'CA')).toBe(true);
      expect(validatePostalCode('V5K 0A1', 'CA')).toBe(true);
    });

    it('should validate Canadian codes without space', () => {
      expect(validatePostalCode('K1A0B1', 'CA')).toBe(true);
      expect(validatePostalCode('V5K0A1', 'CA')).toBe(true);
    });

    it('should be case insensitive for Canadian codes', () => {
      expect(validatePostalCode('k1a 0b1', 'CA')).toBe(true);
      expect(validatePostalCode('v5k 0a1', 'CA')).toBe(true);
    });

    it('should reject invalid Canadian postal codes', () => {
      expect(validatePostalCode('123 456', 'CA')).toBe(false);
      expect(validatePostalCode('AAA AAA', 'CA')).toBe(false);
      expect(validatePostalCode('K1A0B', 'CA')).toBe(false);
    });
  });

  describe('Unknown Country Codes', () => {
    it('should return false for unknown country', () => {
      expect(validatePostalCode('12345', 'XX')).toBe(false);
      expect(validatePostalCode('ABC123', 'UNKNOWN')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(validatePostalCode('', 'US')).toBe(false);
      expect(validatePostalCode('', 'UK')).toBe(false);
      expect(validatePostalCode('', 'CA')).toBe(false);
    });

    it('should default to US when country not specified', () => {
      expect(validatePostalCode('12345')).toBe(true);
      expect(validatePostalCode('SW1A 1AA')).toBe(false);
    });
  });
});
