import { useState, useCallback, useRef } from 'react';

export function useOptimizedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(initialValue);

  const setOptimizedState = useCallback((newValue: T | ((prevState: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newValue === 'function' 
        ? (newValue as (prevState: T) => T)(prevState)
        : newValue;
      
      stateRef.current = nextState;
      return nextState;
    });
  }, []);

  const getCurrentState = useCallback(() => stateRef.current, []);

  return [state, setOptimizedState, getCurrentState] as const;
}

export function useThrottledState<T>(initialValue: T, delay: number = 16) {
  const [state, setState] = useState<T>(initialValue);
  const throttleRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pendingValueRef = useRef<T>(initialValue);

  const setThrottledState = useCallback((newValue: T | ((prevState: T) => T)) => {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as (prevState: T) => T)(state)
      : newValue;
    
    pendingValueRef.current = nextValue;

    if (!throttleRef.current) {
      throttleRef.current = setTimeout(() => {
        setState(pendingValueRef.current);
        throttleRef.current = undefined;
      }, delay);
    }
  }, [state, delay]);

  return [state, setThrottledState] as const;
}