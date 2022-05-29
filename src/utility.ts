import type { MutableRefObject } from "react";
import { REACT } from ".";
import Deepclone from "rfdc";

const deepclone = Deepclone({
  proto: true,
  circles: false,
});

const useLazyRef = <T>(lazyInit: () => T) => {
  const { useEffect, useRef } = REACT;

  if (useEffect === null || useRef === null) {
    throw new Error("Please prepare react before use");
  }

  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = lazyInit();
  }
  return ref as MutableRefObject<T>;
};

const createMounted = () => false;

const useMounted = () => {
  const { useEffect, useRef } = REACT;

  if (useEffect === null || useRef === null) {
    throw new Error("Please prepare react before use");
  }

  const mounted = useLazyRef(createMounted);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return mounted;
};

export { deepclone, useLazyRef, useMounted };
