import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial Value', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should handle different data types', () => {
      const { result: stringResult } = renderHook(() => useDebounce('test', 500));
      expect(stringResult.current).toBe('test');

      const { result: numberResult } = renderHook(() => useDebounce(42, 500));
      expect(numberResult.current).toBe(42);

      const { result: boolResult } = renderHook(() => useDebounce(true, 500));
      expect(boolResult.current).toBe(true);

      const { result: objResult } = renderHook(() => useDebounce({ name: 'test' }, 500));
      expect(objResult.current).toEqual({ name: 'test' });
    });

    it('should handle null and undefined', () => {
      const { result: nullResult } = renderHook(() => useDebounce(null, 500));
      expect(nullResult.current).toBe(null);

      const { result: undefinedResult } = renderHook(() => useDebounce(undefined, 500));
      expect(undefinedResult.current).toBe(undefined);
    });
  });

  describe('Value Changes', () => {
    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'updated', delay: 500 });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should reset timeout on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'first', delay: 500 });
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('initial');

      rerender({ value: 'second', delay: 500 });
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('initial');

      rerender({ value: 'final', delay: 500 });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('final');
    });

    it('should handle multiple sequential updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'v1', delay: 200 } }
      );

      expect(result.current).toBe('v1');

      rerender({ value: 'v2', delay: 200 });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('v2');

      rerender({ value: 'v3', delay: 200 });
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('v3');
    });

    it('should not update before delay expires', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 1000 } }
      );

      rerender({ value: 'updated', delay: 1000 });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(499);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });
  });

  describe('Delay Changes', () => {
    it('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated', delay: 1000 });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('updated');
    });

    it('should work with zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      );

      rerender({ value: 'updated', delay: 0 });
      
      act(() => {
        jest.advanceTimersByTime(0);
      });
      expect(result.current).toBe('updated');
    });

    it('should work with different delay values', () => {
      const { result: result100 } = renderHook(() => useDebounce('test', 100));
      expect(result100.current).toBe('test');

      const { result: result1000 } = renderHook(() => useDebounce('test', 1000));
      expect(result1000.current).toBe('test');

      const { result: result5000 } = renderHook(() => useDebounce('test', 5000));
      expect(result5000.current).toBe('test');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const { unmount, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated', delay: 500 });
      unmount();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should not throw or cause issues
      expect(jest.getTimerCount()).toBe(0);
    });

  it('should cleanup previous timeout on value change', () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');      const { rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated1', delay: 500 });
      rerender({ value: 'updated2', delay: 500 });

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should cleanup previous timeout on delay change', () => {
      const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');
      
      const { rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'test', delay: 500 } }
      );

      rerender({ value: 'test', delay: 1000 });

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const { result } = renderHook(() => useDebounce('', 500));
      expect(result.current).toBe('');
    });

    it('should handle array values', () => {
      const arr = [1, 2, 3];
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: arr, delay: 500 } }
      );

      expect(result.current).toBe(arr);

      const newArr = [4, 5, 6];
      rerender({ value: newArr, delay: 500 });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe(newArr);
    });

    it('should handle complex objects', () => {
      const obj = { name: 'John', age: 30, nested: { value: 'test' } };
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: obj, delay: 500 } }
      );

      expect(result.current).toBe(obj);

      const newObj = { ...obj, age: 31 };
      rerender({ value: newObj, delay: 500 });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe(newObj);
    });

    it('should preserve reference equality when not changed', () => {
      const obj = { value: 'test' };
      const { result } = renderHook(() => useDebounce(obj, 500));
      
      expect(result.current).toBe(obj);
    });

    it('should handle same value updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'test', delay: 500 } }
      );

      rerender({ value: 'test', delay: 500 });
      
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('test');
    });
  });
});
