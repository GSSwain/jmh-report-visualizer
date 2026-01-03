import { test, expect } from '@playwright/test';
import { getBenchmarkDisplayName } from './utils';

test.describe('Utils: getBenchmarkDisplayName', () => {
  test('should return the full name when showClass is true', () => {
    const fullName = 'com.example.Benchmark.method';
    expect(getBenchmarkDisplayName(fullName, true)).toBe(fullName);
  });

  test('should return only the method name when showClass is false', () => {
    const fullName = 'com.example.Benchmark.method';
    expect(getBenchmarkDisplayName(fullName, false)).toBe('method');
  });

  test('should return the full name when showClass is false but there are no dots', () => {
    const fullName = 'methodName';
    expect(getBenchmarkDisplayName(fullName, false)).toBe(fullName);
  });

  test('should handle empty strings', () => {
    expect(getBenchmarkDisplayName('', false)).toBe('');
  });
});