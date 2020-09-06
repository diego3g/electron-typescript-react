/**
 * This is a utility hook that's used to
 * compare immutable arrays before updating their
 * value. It's not as efficient as something like
 * a "useMemo" function, since we still have to
 * run the function, but it will prevent re-rendering
 * due to reference changes between otherwise similar
 * immutable arrays
 */
import { useState } from 'react';

export function useStateMemoArray<T, U>(
  initialState: T[],
  memoFunc: (item: T) => U
): [T[], (newArr: T[]) => void] {
  const [arr, setArr] = useState(initialState);

  // This creates a "lookup" set, which we
  // will use to compare our values before
  // we update our memoized state
  const lookup = new Set<U>();
  arr.forEach((item) => {
    const lookupValue = memoFunc(item);
    lookup.add(lookupValue);
  });

  /**
   * @TODO right now this isn't as fully-featured as
   * useState, since we can only set values directly and
   * can't use functions. Should update this if it
   * becomes a problem
   * ~reccanti 9/5/2020
   */
  function setArrMemoized(newArr: T[]) {
    // if the lengths aren't equal, we know something changed,
    // so we don't have to bother iterating over everything
    if (arr.length !== newArr.length) {
      setArr(newArr);
      return;
    }
    for (const item of newArr) {
      const lookupValue = memoFunc(item);
      if (!lookup.has(lookupValue)) {
        setArr(newArr);
        break;
      }
    }
  }

  return [arr, setArrMemoized];
}
