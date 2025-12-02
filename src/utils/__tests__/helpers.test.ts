import {
  deepClone,
  groupBy,
  chunk,
  unique,
  sortBy,
  randomId,
  debounce,
  throttle,
  sleep,
  retry,
} from '../helpers';

jest.useFakeTimers();

describe('deepClone', () => {
  it('should clone primitive values', () => {
    expect(deepClone(5)).toBe(5);
    expect(deepClone('test')).toBe('test');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
  });

  it('should clone nested arrays', () => {
    const arr = [1, [2, 3], [4, [5, 6]]];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[1]).not.toBe(arr[1]);
  });

  it('should clone objects', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it('should clone Date objects', () => {
    const date = new Date('2024-01-01');
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
    expect(cloned instanceof Date).toBe(true);
  });

  it('should clone complex nested objects', () => {
    const obj = {
      name: 'test',
      nested: {
        value: 123,
        deeper: {
          array: [1, 2, 3],
        },
      },
    };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned.nested).not.toBe(obj.nested);
    expect(cloned.nested.deeper.array).not.toBe(obj.nested.deeper.array);
  });

  it('should handle arrays of objects', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned[0]).not.toBe(arr[0]);
  });

  it('should handle empty objects and arrays', () => {
    expect(deepClone({})).toEqual({});
    expect(deepClone([])).toEqual([]);
  });
});

describe('groupBy', () => {
  it('should group array items by key', () => {
    const items = [
      { category: 'A', value: 1 },
      { category: 'B', value: 2 },
      { category: 'A', value: 3 },
    ];
    const grouped = groupBy(items, 'category');
    expect(grouped['A']).toHaveLength(2);
    expect(grouped['B']).toHaveLength(1);
  });

  it('should handle empty arrays', () => {
    const grouped = groupBy([], 'key');
    expect(grouped).toEqual({});
  });

  it('should group by numeric keys', () => {
    const items = [
      { age: 25, name: 'John' },
      { age: 30, name: 'Jane' },
      { age: 25, name: 'Bob' },
    ];
    const grouped = groupBy(items, 'age');
    expect(grouped['25']).toHaveLength(2);
    expect(grouped['30']).toHaveLength(1);
  });

  it('should handle single item', () => {
    const items = [{ category: 'A', value: 1 }];
    const grouped = groupBy(items, 'category');
    expect(grouped['A']).toHaveLength(1);
  });

  it('should handle all unique keys', () => {
    const items = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
      { id: 3, value: 'c' },
    ];
    const grouped = groupBy(items, 'id');
    expect(Object.keys(grouped)).toHaveLength(3);
  });
});

describe('chunk', () => {
  it('should split array into chunks', () => {
    const arr = [1, 2, 3, 4, 5];
    const chunks = chunk(arr, 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should handle exact division', () => {
    const arr = [1, 2, 3, 4];
    const chunks = chunk(arr, 2);
    expect(chunks).toEqual([[1, 2], [3, 4]]);
  });

  it('should handle chunk size larger than array', () => {
    const arr = [1, 2, 3];
    const chunks = chunk(arr, 10);
    expect(chunks).toEqual([[1, 2, 3]]);
  });

  it('should handle empty array', () => {
    const chunks = chunk([], 2);
    expect(chunks).toEqual([]);
  });

  it('should handle chunk size of 1', () => {
    const arr = [1, 2, 3];
    const chunks = chunk(arr, 1);
    expect(chunks).toEqual([[1], [2], [3]]);
  });
});

describe('unique', () => {
  it('should remove duplicates from array', () => {
    const arr = [1, 2, 2, 3, 3, 3];
    expect(unique(arr)).toEqual([1, 2, 3]);
  });

  it('should remove duplicates by key', () => {
    const arr = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 1, name: 'C' },
    ];
    const result = unique(arr, 'id');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('A');
  });

  it('should handle empty array', () => {
    expect(unique([])).toEqual([]);
  });

  it('should handle array with no duplicates', () => {
    const arr = [1, 2, 3, 4];
    expect(unique(arr)).toEqual([1, 2, 3, 4]);
  });

  it('should handle strings', () => {
    const arr = ['a', 'b', 'a', 'c', 'b'];
    expect(unique(arr)).toEqual(['a', 'b', 'c']);
  });

  it('should preserve first occurrence when using key', () => {
    const arr = [
      { id: 1, value: 'first' },
      { id: 1, value: 'second' },
    ];
    const result = unique(arr, 'id');
    expect(result[0].value).toBe('first');
  });
});

describe('sortBy', () => {
  it('should sort array by key in ascending order', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const sorted = sortBy(items, 'value', 'asc');
    expect(sorted[0].value).toBe(1);
    expect(sorted[2].value).toBe(3);
  });

  it('should sort array by key in descending order', () => {
    const items = [{ value: 1 }, { value: 3 }, { value: 2 }];
    const sorted = sortBy(items, 'value', 'desc');
    expect(sorted[0].value).toBe(3);
    expect(sorted[2].value).toBe(1);
  });

  it('should sort strings alphabetically', () => {
    const items = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
    const sorted = sortBy(items, 'name', 'asc');
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[2].name).toBe('Charlie');
  });

  it('should not mutate original array', () => {
    const items = [{ value: 3 }, { value: 1 }];
    const original = [...items];
    sortBy(items, 'value', 'asc');
    expect(items).toEqual(original);
  });

  it('should handle empty array', () => {
    const sorted = sortBy([], 'value', 'asc');
    expect(sorted).toEqual([]);
  });

  it('should default to ascending order', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const sorted = sortBy(items, 'value');
    expect(sorted[0].value).toBe(1);
  });
});

describe('randomId', () => {
  it('should generate id of specified length', () => {
    const id = randomId(10);
    expect(id).toHaveLength(10);
  });

  it('should generate id with default length', () => {
    const id = randomId();
    expect(id).toHaveLength(8);
  });

  it('should generate different ids', () => {
    const id1 = randomId();
    const id2 = randomId();
    expect(id1).not.toBe(id2);
  });

  it('should only contain alphanumeric characters', () => {
    const id = randomId(100);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should handle length of 1', () => {
    const id = randomId(1);
    expect(id).toHaveLength(1);
  });
});

describe('debounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should debounce function calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);

    debounced('arg1');
    debounced('arg2');
    debounced('arg3');

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('arg3');
  });

  it('should pass correct arguments', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);

    debounced('test', 123, true);

    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledWith('test', 123, true);
  });

  it('should reset timer on subsequent calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);

    debounced();
    jest.advanceTimersByTime(300);
    debounced();
    jest.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should throttle function calls', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 500);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should allow calls after limit expires', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 500);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass correct arguments on first call', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 500);

    throttled('arg1');
    throttled('arg2');

    expect(fn).toHaveBeenCalledWith('arg1');
  });
});

describe('sleep', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useFakeTimers();
  });

  it('should resolve after specified time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(95);
  });

  it('should return a promise', () => {
    const result = sleep(100);
    expect(result instanceof Promise).toBe(true);
  });
});

describe('retry', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useFakeTimers();
  });

  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await retry(fn, 3, 100);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success');

    const result = await retry(fn, 3, 10);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max attempts', async () => {
    const error = new Error('persistent failure');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(retry(fn, 3, 10)).rejects.toThrow('persistent failure');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use default max attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(retry(fn)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should increase delay between retries', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const start = Date.now();
    
    try {
      await retry(fn, 3, 10);
    } catch (e) {
      // Expected to fail
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThan(25); // 10 + 20
  });
});
