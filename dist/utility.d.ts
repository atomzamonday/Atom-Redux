declare const deepclone: <T>(input: T) => T;
declare const useLazyRef: <T>(lazyInit: () => T) => import("react").MutableRefObject<T>;
declare const useMounted: () => import("react").MutableRefObject<boolean>;
export { deepclone, useLazyRef, useMounted };
