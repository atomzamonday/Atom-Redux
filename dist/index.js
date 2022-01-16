"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUseAtomSelector = exports.useLazyRef = exports.useAtomStoreSelector = exports.createAtomStore = void 0;
const react_1 = require("react");
const nanoid_1 = require("nanoid");
const utility_1 = require("./utility");
Object.defineProperty(exports, "useLazyRef", { enumerable: true, get: function () { return utility_1.useLazyRef; } });
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
        return Object.freeze((0, utility_1.deepclone)(this.__state));
    }
}
const createAtomStore = (initState, reducer) => {
    return new AtomStore(initState, reducer);
};
exports.createAtomStore = createAtomStore;
const shallowShouldUpdate = (pv, cv) => pv !== cv;
const useAtomStoreSelector = (store, selector, shouldUpdate) => {
    const [value, setValue] = (0, react_1.useState)(() => selector(store.getState()));
    const mounted = (0, utility_1.useMounted)();
    const preVal = (0, utility_1.useLazyRef)(() => value);
    (0, react_1.useEffect)(() => {
        const __shouldUpdate = shouldUpdate || shallowShouldUpdate;
        const id = store.subscribe(() => {
            const currentVal = selector(store.getState());
            if (__shouldUpdate(preVal.current, currentVal) === false) {
                return;
            }
            preVal.current = currentVal;
            if (mounted.current) {
                setValue(() => currentVal);
            }
        });
        return () => {
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
