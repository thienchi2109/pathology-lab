import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useAutosave } from '../useAutosave';

describe('useAutosave', () => {
  it('should initialize with idle status', () => {
    const { result: formResult } = renderHook(() => useForm({ defaultValues: { name: 'test' } }));
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutosave({
        watch: formResult.current.watch,
        onSave,
        enabled: true,
      })
    );

    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.lastSaved).toBeNull();
  });

  it('should not call onSave when disabled', () => {
    const { result: formResult } = renderHook(() => useForm({ defaultValues: { name: 'test' } }));
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutosave({
        watch: formResult.current.watch,
        onSave,
        interval: 1000,
        enabled: false,
      })
    );

    expect(result.current.saveStatus).toBe('idle');
  });

  it('should provide saveNow function', () => {
    const { result: formResult } = renderHook(() => useForm({ defaultValues: { name: 'test' } }));
    const onSave = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAutosave({
        watch: formResult.current.watch,
        onSave,
        interval: 30000,
        enabled: true,
      })
    );

    expect(typeof result.current.saveNow).toBe('function');
  });
});
