import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { deepclone, useMounted, useLazyRef } from "./utility";
class Store {
    constructor(initialiseState, reducer) {
        this.subscribers = {};
        this.state = initialiseState();
        this.reducer = reducer;
    }
    async dispatch(action) {
        this.state = deepclone(await this.reducer(this.state, action));
        const ids = Object.keys(this.subscribers);
        ids.forEach((id) => {
            const subscriber = this.subscribers[id];
            if (typeof subscriber === "function") {
                window.setTimeout(() => {
                    const state = deepclone(this.state);
                    subscriber(state);
                });
            }
        });
    }
    getState() {
        return deepclone(this.state);
    }
    subscribe(subscriber) {
        const id = nanoid();
        this.subscribers[id] = subscriber;
        return id;
    }
    unsubscribe(id) {
        if (typeof this.subscribers[id] === "function") {
            delete this.subscribers[id];
        }
    }
}
export const createStore = (initialiseState, reducer) => {
    return new Store(initialiseState, reducer);
};
const shallowCompare = (a, b) => a !== b;
export const useStoreSelector = (store, selector, shouldUpdate) => {
    const isMounted = useMounted();
    const [val, setVal] = useState(() => selector(store.getState()));
    const current = useLazyRef(() => val);
    useEffect(() => {
        const shouldUpdate_ = shouldUpdate || shallowCompare;
        const id = store.subscribe((state) => {
            const newVal = selector(state);
            if (shouldUpdate_(current.current, newVal)) {
                current.current = newVal;
                isMounted.current && setVal(current.current);
            }
        });
        return () => store.unsubscribe(id);
    }, []);
    return val;
};
export const createUseSelector = (store) => {
    return (selector, shouldUpdate) => useStoreSelector(store, selector, shouldUpdate);
};
