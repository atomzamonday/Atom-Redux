"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLazyRef = exports.useAtomStoreSelector = exports.createAtomStore = void 0;
const atom_pubsub_1 = require("atom-pubsub");
const react_1 = require("react");
const rfdc_1 = __importDefault(require("rfdc"));
const nanoid_1 = require("nanoid");
const deepclone = (0, rfdc_1.default)({
    proto: true,
    circles: false,
});
const __state = Symbol();
const __reducer = Symbol();
const __pubid = Symbol();
class AtomStore {
    constructor(initState, reducer) {
        this[__state] = initState;
        this[__reducer] = reducer;
        this[__pubid] = (0, nanoid_1.nanoid)();
    }
    dispatch(action) {
        this[__state] = this[__reducer](this[__state], action);
        atom_pubsub_1.pubsub.publish(this[__pubid]);
    }
    subscribe(callback) {
        return atom_pubsub_1.pubsub.subscribe(this[__pubid], callback);
    }
    unsubscribe(id) {
        atom_pubsub_1.pubsub.unsubscribe(id);
    }
    getState() {
        return Object.freeze(deepclone(this[__state]));
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
const useAtomStoreSelector = (store, selector, shouldUpdate) => {
    const [value, setValue] = (0, react_1.useState)(() => selector(store.getState()));
    const preVal = useLazyRef(() => selector(store.getState()));
    (0, react_1.useEffect)(() => {
        const id = store.subscribe(() => {
            const currentVal = selector(store.getState());
            if (shouldUpdate !== undefined &&
                shouldUpdate(preVal.current, currentVal) === false) {
                return;
            }
            preVal.current = currentVal;
            setValue(() => currentVal);
        });
        return () => {
            store.unsubscribe(id);
        };
    }, []);
    return value;
};
exports.useAtomStoreSelector = useAtomStoreSelector;
