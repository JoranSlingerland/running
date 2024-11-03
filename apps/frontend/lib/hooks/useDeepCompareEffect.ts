/**
 * useDeepCompareEffect - Modified version of useDeepCompareEffect from rooks
 * @description Deep compare dependencies instead of shallow for useEffect
 * @see {@link https://rooks.vercel.app/docs/useDeepCompareEffect}
 */
import isEqual from 'fast-deep-equal';
import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

function useDeepCompareEffect(
  callback: EffectCallback,
  dependencies: DependencyList,
): void {
  const previousDeps = useRef<DependencyList | undefined>(dependencies);

  if (!Array.isArray(dependencies)) {
    throw new Error(
      'useDeepCompareEffect should be used with an array of dependencies',
    );
  }

  if (!isEqual(previousDeps.current, dependencies)) {
    previousDeps.current = dependencies;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, previousDeps.current);
}

export { useDeepCompareEffect };
