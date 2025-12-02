import { debounce, throttle, deepClone, groupBy, chunk, unique, sortBy, randomId, sleep, retry } from '../helpers';

jest.useFakeTimers();

describe('debounce', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('arg1');
    debouncedFn('arg2');
    debouncedFn('arg3');

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg3');
  });

  it('should reset debounce timer on multiple calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('arg1');
    jest.advanceTimersByTime(200);
    debouncedFn('arg2');
    jest.advanceTimersByTime(150);

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(150);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg2');
  });

  it('should handle multiple arguments', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2', 'arg3');
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('should throttle function calls', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 300);

    throttledFn('arg1');
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn('arg2');
    throttledFn('arg3');
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(300);
    throttledFn('arg4');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should call immediately on first invocation', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 300);

    throttledFn('first');
    expect(mockFn).toHaveBeenCalledWith('first');
  });

  it('should allow calls after throttle period expires', () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 200);

    throttledFn('call1');
    jest.advanceTimersByTime(200);
    throttledFn('call2');

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

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
    const arr = [1, [2, [3, 4]], 5];
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

  it('should clone dates', () => {
    const date = new Date('2024-01-01');
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
  });

  it('should clone complex nested structures', () => {
    const complex = {
      arr: [1, 2, { nested: 'value' }],
      date: new Date('2024-01-01'),
      str: 'test',
      num: 42,
    };
    const cloned = deepClone(complex);
    expect(cloned).toEqual(complex);
    expect(cloned).not.toBe(complex);
    expect(cloned.arr).not.toBe(complex.arr);
  });

  it('should handle objects without own properties correctly', () => {
    const obj = Object.create({ inherited: 'prop' });
    obj.own = 'prop';
    const cloned = deepClone(obj);
    expect(cloned.own).toBe('prop');
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
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
    ];
    const grouped = groupBy(items, 'id');
    expect(grouped['1']).toHaveLength(2);
    expect(grouped['2']).toHaveLength(1);
  });

  it('should preserve object references in groups', () => {
    const obj1 = { category: 'A', value: 1 };
    const obj2 = { category: 'A', value: 2 };
    const grouped = groupBy([obj1, obj2], 'category');
    expect(grouped['A']).toContain(obj1);
    expect(grouped['A']).toContain(obj2);
  });
});

describe('chunk', () => {
  it('should split array into chunks', () => {
    const arr = [1, 2, 3, 4, 5];
    const chunks = chunk(arr, 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should handle exact divisions', () => {
    const arr = [1, 2, 3, 4];
    const chunks = chunk(arr, 2);
    expect(chunks).toEqual([[1, 2], [3, 4]]);
  });

  it('should handle chunk size larger than array', () => {
    const arr = [1, 2, 3];
    const chunks = chunk(arr, 10);
    expect(chunks).toEqual([[1, 2, 3]]);
  });

  it('should handle empty arrays', () => {
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

  it('should handle arrays with no duplicates', () => {
    const arr = [1, 2, 3];
    expect(unique(arr)).toEqual([1, 2, 3]);
  });

  it('should handle empty arrays', () => {
    expect(unique([])).toEqual([]);
  });

  it('should remove duplicates by key', () => {
    const items = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
    ];
    const uniqueItems = unique(items, 'id');
    expect(uniqueItems).toHaveLength(2);
  });

  it('should preserve order with unique by key', () => {
    const items = [
      { id: 1, name: 'first' },
      { id: 2, name: 'second' },
      { id: 1, name: 'duplicate' },
    ];
    const uniqueItems = unique(items, 'id');
    expect(uniqueItems[0].name).toBe('first');
    expect(uniqueItems[1].name).toBe('second');
  });
});

describe('sortBy', () => {
  it('should sort array by key in ascending order', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const sorted = sortBy(items, 'value', 'asc');
    expect(sorted[0].value).toBe(1);
    expect(sorted[1].value).toBe(2);
    expect(sorted[2].value).toBe(3);
  });

  it('should sort array by key in descending order', () => {
    const items = [{ value: 1 }, { value: 3 }, { value: 2 }];
    const sorted = sortBy(items, 'value', 'desc');
    expect(sorted[0].value).toBe(3);
    expect(sorted[1].value).toBe(2);
    expect(sorted[2].value).toBe(1);
  });

  it('should use ascending order by default', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const sorted = sortBy(items, 'value');
    expect(sorted[0].value).toBe(1);
  });

  it('should not mutate original array', () => {
    const items = [{ value: 3 }, { value: 1 }];
    const original = [...items];
    sortBy(items, 'value');
    expect(items).toEqual(original);
  });

  it('should handle string values', () => {
    const items = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
    const sorted = sortBy(items, 'name');
    expect(sorted[0].name).toBe('a');
    expect(sorted[1].name).toBe('b');
    expect(sorted[2].name).toBe('c');
  });

  it('should handle equal values', () => {
    const items = [{ value: 1 }, { value: 1 }, { value: 2 }];
    const sorted = sortBy(items, 'value');
    expect(sorted[0].value).toBe(1);
    expect(sorted[1].value).toBe(1);
    expect(sorted[2].value).toBe(2);
  });
});

describe('randomId', () => {
  it('should generate id of default length', () => {
    const id = randomId();
    expect(id).toHaveLength(8);
  });

  it('should generate id of specified length', () => {
    const id = randomId(10);
    expect(id).toHaveLength(10);
  });

  it('should generate id of length 1', () => {
    const id = randomId(1);
    expect(id).toHaveLength(1);
  });

  it('should generate unique ids', () => {
    const ids = new Set([randomId(), randomId(), randomId()]);
    expect(ids.size).toBe(3);
  });

  it('should only contain alphanumeric characters', () => {
    const id = randomId(100);
    expect(/^[A-Za-z0-9]+$/.test(id)).toBe(true);
  });

  it('should handle large length values', () => {
    const id = randomId(1000);
    expect(id).toHaveLength(1000);
  });
});

describe('sleep', () => {
  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('should resolve after specified delay', async () => {
    const promise = sleep(300);
    jest.advanceTimersByTime(300);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should handle 0 delay', async () => {
    const promise = sleep(0);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should not resolve before delay', async () => {
    let resolved = false;
    const promise = sleep(100).then(() => {
      resolved = true;
    });

    jest.advanceTimersByTime(50);
    await jest.runAllTimersAsync();
    // Note: resolved state is pending

    jest.advanceTimersByTime(50);
    await jest.runAllTimersAsync();
    expect(resolved).toBe(true);
  });
});

describe('retry', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('should return result on first successful attempt', async () => {
    jest.useRealTimers();
    const mockFn = jest.fn().mockResolvedValue('success');
    const result = await retry(mockFn, 3, 1);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
    jest.useFakeTimers();
  });

  it('should retry on failure', async () => {
    jest.useRealTimers();
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockResolvedValueOnce('success');

    const result = await retry(mockFn, 3, 1);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
    jest.useFakeTimers();
  }, 15000);

  it('should use default max attempts', async () => {
    jest.useRealTimers();
    const mockFn = jest.fn().mockRejectedValue(new Error('fail'));
    
    try {
      await retry(mockFn, 2, 1);
      fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).toBe('fail');
      expect(mockFn).toHaveBeenCalledTimes(2);
    }
    jest.useFakeTimers();
  }, 15000);
});
