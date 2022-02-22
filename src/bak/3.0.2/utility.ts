import { useEffect, useRef } from "react";
import Deepclone from "rfdc";

const deepclone = Deepclone({
  proto: true,
  circles: false,
});

const useLazyRef = <T>(lazyInit: () => T) => {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = lazyInit();
  }
  return ref as React.MutableRefObject<T>;
};

const createMounted = () => false;

const useMounted = () => {
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
