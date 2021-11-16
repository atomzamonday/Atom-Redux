"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _AtomStore_state, _AtomStore_reducer, _AtomStore_pubId;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLazyRef = exports.useAtomStoreSelector = exports.AtomStore = void 0;
const atom_pubsub_1 = require("atom-pubsub");
const react_1 = require("react");
const rfdc_1 = __importDefault(require("rfdc"));
const nanoid_1 = require("nanoid");
const deepclone = (0, rfdc_1.default)({
    proto: true,
    circles: false,
});
class AtomStore {
    constructor(initState, reducer) {
        _AtomStore_state.set(this, void 0);
        _AtomStore_reducer.set(this, void 0);
        _AtomStore_pubId.set(this, void 0);
        __classPrivateFieldSet(this, _AtomStore_state, initState, "f");
        __classPrivateFieldSet(this, _AtomStore_reducer, reducer, "f");
        __classPrivateFieldSet(this, _AtomStore_pubId, (0, nanoid_1.nanoid)(), "f");
    }
    dispatch(action) {
        __classPrivateFieldSet(this, _AtomStore_state, __classPrivateFieldGet(this, _AtomStore_reducer, "f").call(this, __classPrivateFieldGet(this, _AtomStore_state, "f"), action), "f");
        atom_pubsub_1.pubsub.publish(__classPrivateFieldGet(this, _AtomStore_pubId, "f"));
    }
    subscribe(callback) {
        return atom_pubsub_1.pubsub.subscribe(__classPrivateFieldGet(this, _AtomStore_pubId, "f"), callback);
    }
    unsubscribe(id) {
        atom_pubsub_1.pubsub.unsubscribe(id);
    }
    getState() {
        return deepclone(__classPrivateFieldGet(this, _AtomStore_state, "f"));
    }
}
exports.AtomStore = AtomStore;
_AtomStore_state = new WeakMap(), _AtomStore_reducer = new WeakMap(), _AtomStore_pubId = new WeakMap();
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
            if (shouldUpdate !== undefined) {
                if (shouldUpdate(preVal.current, currentVal) === false) {
                    return;
                }
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
