import { useEffect, useRef } from "react";
import Deepclone from "rfdc";
const deepclone = Deepclone({
    proto: true,
    circles: false,
});
const useLazyRef = (lazyInit) => {
    const ref = useRef();
    if (ref.current === undefined) {
        ref.current = lazyInit();
    }
    return ref;
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
