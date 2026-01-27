import { debounce, throttle, deepClone, groupBy, chunk, unique, sortBy, randomId, sleep, retry } from '../helpers';

describe('deepClone', () => {
  it('should clone primitive values', () => {
    expect(deepClone(5)).toBe(5);
    expect(deepClone('test')).toBe('test');
    expect(deepClone(true)).toBe(true);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
  });

  it('should clone objects', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it('should clone dates and nested structures', () => {
    const date = new Date();
    const obj = { d: date, arr: [{ x: 1 }] };
    const cloned = deepClone(obj);
    expect(cloned.d).not.toBe(date);
    expect(cloned.d.getTime()).toBe(date.getTime());
    expect(cloned.arr[0]).not.toBe(obj.arr[0]);
    expect(cloned.arr).toEqual(obj.arr);
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
});

describe('chunk', () => {
  it('should split array into chunks', () => {
    const arr = [1, 2, 3, 4, 5];
    const chunks = chunk(arr, 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('unique', () => {
  it('should remove duplicates from array', () => {
    const arr = [1, 2, 2, 3, 3, 3];
    expect(unique(arr)).toEqual([1, 2, 3]);
  });

  it('should remove duplicates by key for objects', () => {
    const arr = [
      { id: 1, name: 'a' },
      { id: 1, name: 'b' },
      { id: 2, name: 'c' },
    ];
    expect(unique(arr, 'id')).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'c' },
    ]);
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
    expect(sorted.map(i => i.value)).toEqual([3, 2, 1]);
  });
});

describe('randomId', () => {
  it('should generate id of specified length', () => {
    const id = randomId(10);
    expect(id).toHaveLength(10);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe('debounce', () => {
  it('should delay execution and coalesce calls', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced('a');
    debounced('b');
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
    jest.useRealTimers();
  });
});

describe('throttle', () => {
  it('should limit calls within time window', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const throttled = throttle(fn, 300);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(300);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});

describe('sleep', () => {
  it('resolves after given time', async () => {
    jest.useFakeTimers();
    const promise = sleep(500);
    jest.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();
  });
});

describe('retry', () => {
  it('retries until success', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockResolvedValue('ok');

    await expect(retry(fn, 3, 1)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(retry(fn, 2, 1)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
