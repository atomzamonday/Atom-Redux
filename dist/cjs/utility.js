"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMounted = exports.useLazyRef = exports.deepclone = void 0;
const tslib_1 = require("tslib");
const react_1 = require("react");
const rfdc_1 = (0, tslib_1.__importDefault)(require("rfdc"));
const deepclone = (0, rfdc_1.default)({
    proto: true,
    circles: false,
});
exports.deepclone = deepclone;
const useLazyRef = (lazyInit) => {
    const ref = (0, react_1.useRef)();
    if (ref.current === undefined) {
        ref.current = lazyInit();
    }
    return ref;
};
exports.useLazyRef = useLazyRef;
const createMounted = () => false;
const useMounted = () => {
    const mounted = useLazyRef(createMounted);
    (0, react_1.useEffect)(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    return mounted;
};
exports.useMounted = useMounted;
