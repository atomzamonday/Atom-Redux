import { MutableRefObject } from "react";
declare const deepclone: <T>(input: T) => T;
declare const useLazyRef: <T>(lazyInit: () => T) => MutableRefObject<T>;
declare const useMounted: () => MutableRefObject<boolean>;
export { deepclone, useLazyRef, useMounted };
