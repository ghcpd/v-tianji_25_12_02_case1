import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

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

  it('should debounce with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated1', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    rerender({ value: 'updated2', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated2');
  });

  it('should handle null/undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null as any, delay: 500 } }
    );

    expect(result.current).toBe(null);

    rerender({ value: 'text', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('text');
  });

  it('should handle numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 500 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 123, delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe(123);
  });

  it('should handle object values', () => {
    const obj1 = { name: 'test' };
    const obj2 = { name: 'updated' };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj1, delay: 500 } }
    );

    expect(result.current).toBe(obj1);

    rerender({ value: obj2, delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe(obj2);
  });

  it('should handle rapid consecutive updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'update1', delay: 100 });
    act(() => jest.advanceTimersByTime(50));
    
    rerender({ value: 'update2', delay: 100 });
    act(() => jest.advanceTimersByTime(50));
    
    rerender({ value: 'update3', delay: 100 });
    expect(result.current).toBe('initial');

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('update3');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('updated');
  });

  it('should cleanup on unmount', () => {
    const { unmount, result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
    
    unmount();
    // No errors should occur
    expect(true).toBe(true);
  });

  it('should debounce empty strings', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: '', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('');
  });
});
