import { useRef } from "react";
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

export { deepclone, useLazyRef };
