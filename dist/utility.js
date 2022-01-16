"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLazyRef = exports.deepclone = void 0;
const react_1 = require("react");
const rfdc_1 = __importDefault(require("rfdc"));
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
