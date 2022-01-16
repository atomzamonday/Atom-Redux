declare const deepclone: <T>(input: T) => T;
declare const useLazyRef: <T>(lazyInit: () => T) => import("react").MutableRefObject<T>;
export { deepclone, useLazyRef };
