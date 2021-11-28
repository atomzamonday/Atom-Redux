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
const AtomStoreClass = (() => {
    const __private__ = {};
    class AtomStore {
        constructor(initState, reducer) {
            this.id = (0, nanoid_1.nanoid)();
            __private__[this.id] = {
                state: initState,
                reducer: reducer,
                pubId: (0, nanoid_1.nanoid)(),
            };
        }
        dispatch(action) {
            const { state, reducer, pubId } = __private__[this.id];
            __private__[this.id].state = reducer(state, action);
            atom_pubsub_1.pubsub.publish(pubId);
        }
        subscribe(callback) {
            const { pubId } = __private__[this.id];
            return atom_pubsub_1.pubsub.subscribe(pubId, callback);
        }
        unsubscribe(id) {
            atom_pubsub_1.pubsub.unsubscribe(id);
        }
        getState() {
            return Object.freeze(deepclone(__private__[this.id].state));
        }
    }
    return AtomStore;
})();
const createAtomStore = (initState, reducer) => {
    return new AtomStoreClass(initState, reducer);
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
