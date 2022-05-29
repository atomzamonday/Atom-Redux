"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUseSelector = exports.useStoreSelector = exports.createStore = void 0;
const nanoid_1 = require("nanoid");
const react_1 = require("react");
const utility_1 = require("./utility");
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
        this.state = (0, utility_1.deepclone)(await this.reducer(this.state, action));
        const ids = Object.keys(this.subscribers);
        ids.forEach((id) => {
            const subscriber = this.subscribers[id];
            if (typeof subscriber === "function") {
                window.setTimeout(() => {
                    const state = (0, utility_1.deepclone)(this.state);
                    subscriber(state);
                });
            }
        });
    }
    dispatch(action) {
        return this.runner.push(this._dispatch.bind(this, action));
    }
    getState() {
        return (0, utility_1.deepclone)(this.state);
    }
    subscribe(subscriber) {
        const id = (0, nanoid_1.nanoid)();
        this.subscribers[id] = subscriber;
        return id;
    }
    unsubscribe(id) {
        if (typeof this.subscribers[id] === "function") {
            delete this.subscribers[id];
        }
    }
}
const createStore = (initialiseState, reducer) => {
    return new Store(initialiseState, reducer);
};
exports.createStore = createStore;
const shallowCompare = (a, b) => a !== b;
const useStoreSelector = (store, selector, shouldUpdate) => {
    const isMounted = (0, utility_1.useMounted)();
    const [val, setVal] = (0, react_1.useState)(() => selector(store.getState()));
    const current = (0, utility_1.useLazyRef)(() => val);
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useDebugValue)(val);
    return val;
};
exports.useStoreSelector = useStoreSelector;
const createUseSelector = (store) => {
    return (selector, shouldUpdate) => (0, exports.useStoreSelector)(store, selector, shouldUpdate);
};
exports.createUseSelector = createUseSelector;
