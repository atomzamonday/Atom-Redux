"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUseAtomSelector = exports.useLazyRef = exports.useAtomStoreSelector = exports.createAtomStore = void 0;
const react_1 = require("react");
const rfdc_1 = __importDefault(require("rfdc"));
const nanoid_1 = require("nanoid");
const deepclone = (0, rfdc_1.default)({
    proto: true,
    circles: false,
});
class AtomStore {
    constructor(initState, reducer) {
        this.__listenerIds = [];
        this.__listeners = {};
        this.__state = initState;
        this.__reducer = reducer;
    }
    dispatch(action) {
        this.__state = this.__reducer(this.__state, action);
        this.__listenerIds.forEach((id) => {
            const listener = this.__listeners[id];
            if (listener !== undefined) {
                listener(this.getState());
            }
        });
    }
    subscribe(lisenerCallback) {
        const id = (0, nanoid_1.nanoid)();
        this.__listenerIds.push(id);
        this.__listeners[id] = lisenerCallback;
        return id;
    }
    unsubscribe(id) {
        this.__listenerIds = this.__listenerIds.filter((listenerId) => id !== listenerId);
        this.__listeners[id] = null;
    }
    getState() {
        return Object.freeze(deepclone(this.__state));
    }
}
const createAtomStore = (initState, reducer) => {
    return new AtomStore(initState, reducer);
};
exports.createAtomStore = createAtomStore;
const useLazyRef = (lazyInit) => {
    const ref = (0, react_1.useRef)();
    if (ref.current === undefined) {
        ref.current = lazyInit();
    }
    return ref;
};
exports.useLazyRef = useLazyRef;
const shallowShouldUpdate = (pv, cv) => pv !== cv;
const useAtomStoreSelector = (store, selector, shouldUpdate) => {
    const [value, setValue] = (0, react_1.useState)(() => selector(store.getState()));
    const ref = useLazyRef(() => ({
        preVal: selector(store.getState()),
        mounted: false,
    }));
    (0, react_1.useEffect)(() => {
        ref.current.mounted = true;
        const __shouldUpdate = shouldUpdate || shallowShouldUpdate;
        const id = store.subscribe(() => {
            const currentVal = selector(store.getState());
            if (__shouldUpdate(ref.current.preVal, currentVal) === false) {
                return;
            }
            ref.current.preVal = currentVal;
            if (ref.current.mounted) {
                setValue(() => currentVal);
            }
        });
        return () => {
            ref.current.mounted = false;
            store.unsubscribe(id);
        };
    }, []);
    return value;
};
exports.useAtomStoreSelector = useAtomStoreSelector;
const createUseAtomSelector = (store) => {
    return (selector, shouldUpdate) => useAtomStoreSelector(store, selector, shouldUpdate);
};
exports.createUseAtomSelector = createUseAtomSelector;
