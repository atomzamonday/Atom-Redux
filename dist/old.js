import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { deepclone, useLazyRef, useMounted } from "./utility";
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
        const id = nanoid();
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
const shallowShouldUpdate = (pv, cv) => pv !== cv;
const useAtomStoreSelector = (store, selector, shouldUpdate) => {
    const [value, setValue] = useState(() => selector(store.getState()));
    const mounted = useMounted();
    const preVal = useLazyRef(() => value);
    useEffect(() => {
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
const createUseAtomSelector = (store) => {
    return (selector, shouldUpdate) => useAtomStoreSelector(store, selector, shouldUpdate);
};
export { createAtomStore, useAtomStoreSelector, useLazyRef, createUseAtomSelector, };
