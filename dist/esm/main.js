import { nanoid } from "nanoid";
import { deepclone, useMounted, useLazyRef } from "./utility";
class Runner {
    constructor() {
        this.runners = [];
        this.running = false;
        this.promise = Promise.resolve();
    }
    async run() {
        this.running = true;
        while (this.runners.length > 0) {
            await this.runners[0]();
            this.runners.shift();
        }
        this.running = false;
    }
    push(runner) {
        this.runners.push(runner);
        if (this.running === false) {
            this.promise = this.run();
        }
        return this.promise;
    }
}
class Store {
    constructor(initialiseState, reducer) {
        this.subscribers = {};
        this.runner = new Runner();
        this.state = initialiseState();
        this.reducer = reducer;
    }
    async _dispatch(action) {
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
    dispatch(action) {
        return this.runner.push(this._dispatch.bind(this, action));
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
    const { useState, useEffect, useDebugValue } = REACT;
    if (useState === null || useEffect === null || useDebugValue === null) {
        throw new Error("Please prepare react before use");
    }
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
    useDebugValue(val);
    return val;
};
export const createUseSelector = (store) => {
    return (selector, shouldUpdate) => useStoreSelector(store, selector, shouldUpdate);
};
const createPrepareReact = () => {
    const REACT = {
        useState: null,
        useDebugValue: null,
        useEffect: null,
        useRef: null,
    };
    return {
        prepareReact(react) {
            const { useState, useDebugValue, useEffect, useRef } = react;
            REACT.useState = useState.bind(react);
            REACT.useDebugValue = useDebugValue.bind(react);
            REACT.useEffect = useEffect.bind(react);
            REACT.useRef = useRef.bind(react);
            Object.freeze(REACT);
        },
        get REACT() {
            return REACT;
        },
    };
};
export const { prepareReact, REACT } = createPrepareReact();
