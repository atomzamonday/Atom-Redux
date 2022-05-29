"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMounted = exports.useLazyRef = exports.deepclone = void 0;
const tslib_1 = require("tslib");
const _1 = require(".");
const rfdc_1 = (0, tslib_1.__importDefault)(require("rfdc"));
const deepclone = (0, rfdc_1.default)({
    proto: true,
    circles: false,
});
exports.deepclone = deepclone;
const useLazyRef = (lazyInit) => {
    const { useEffect, useRef } = _1.REACT;
    if (useEffect === null || useRef === null) {
        throw new Error("Please prepare react before use");
    }
    const ref = useRef();
    if (ref.current === undefined) {
        ref.current = lazyInit();
    }
    return ref;
};
exports.useLazyRef = useLazyRef;
const createMounted = () => false;
const useMounted = () => {
    const { useEffect, useRef } = _1.REACT;
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
exports.useMounted = useMounted;
