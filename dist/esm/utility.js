import { REACT } from ".";
import Deepclone from "rfdc";
const deepclone = Deepclone({
    proto: true,
    circles: false,
});
const useLazyRef = (lazyInit) => {
    const { useEffect, useRef } = REACT;
    if (useEffect === null || useRef === null) {
        throw new Error("Please prepare react before use");
    }
    const ref = useRef();
    if (ref.current === undefined) {
        ref.current = lazyInit();
    }
    return ref;
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
