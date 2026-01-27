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

  it('should clone Date objects', () => {
    const date = new Date('2020-01-01T00:00:00Z');
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
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
});

describe('sortBy', () => {
  it('should sort array by key in ascending order', () => {
    const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
    const sorted = sortBy(items, 'value', 'asc');
    expect(sorted[0].value).toBe(1);
    expect(sorted[2].value).toBe(3);
  });
});

describe('randomId', () => {
  it('should generate id of specified length', () => {
    const id = randomId(10);
    expect(id).toHaveLength(10);
  });
});

describe('debounce', () => {
  it('should call function after delay and cancel previous', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 1000);

    debounced('a');
    debounced('b');

    // not called immediately
    expect(fn).not.toBeCalled();

    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
  });
});

describe('throttle', () => {
  it('should call function at most once per limit', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 1000);

    throttled(1);
    throttled(2);
    throttled(3);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);

    jest.advanceTimersByTime(1000);
    throttled(4);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(4);
  });
});

describe('sleep', () => {
  it('should resolve after given ms', async () => {
    const p = sleep(500);
    jest.advanceTimersByTime(500);
    await expect(p).resolves.toBeUndefined();
  });
});

describe('retry', () => {
  it('should retry until success', async () => {
    // use real timers for this test because retry uses async sleeps
    jest.useRealTimers();
    let attempts = 0;
    const fn = jest.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 3) throw new Error('failed');
      return 'ok';
    });

    const resultPromise = retry(fn, 5, 10);

    // wait for the retries to resolve (using real timers)
    await expect(resultPromise).resolves.toBe('ok');
    jest.useFakeTimers();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw after max attempts', async () => {
    // use real timers to allow the retry sleep to run
    jest.useRealTimers();
    const fn = jest.fn().mockRejectedValue(new Error('broken'));
    const p = retry(fn, 2, 5);

    await expect(p).rejects.toThrow('broken');
    jest.useFakeTimers();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
