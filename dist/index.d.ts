declare type Dispatch<Payload extends {}, Action extends string | undefined = undefined> = Action extends undefined ? {
    payload: Payload;
} : {
    action: Action;
    payload: Payload;
};
declare type Reducer<State extends {}, Dispatching extends Dispatch<Partial<State>, string>> = (state: State, dispatch: Dispatching) => State;
declare class AtomStore<State extends {}, Dispatching extends Dispatch<Partial<State>, string>> {
    private __state;
    private __reducer;
    private __listenerIds;
    private __listeners;
    constructor(initState: State, reducer: Reducer<State, Dispatching>);
    dispatch(action: Dispatching): void;
    subscribe(lisenerCallback: (state: State) => any): string;
    unsubscribe(id: string): void;
    getState(): Readonly<State>;
}
declare const createAtomStore: <State extends {}, Dispatching extends {
    action: string;
    payload: Partial<State>;
}>(initState: State, reducer: Reducer<State, Dispatching>) => AtomStore<State, Dispatching>;
declare const useAtomStoreSelector: <Selected extends unknown, Store extends AtomStore<State, {
    action: string;
    payload: Partial<{}>;
}>, State extends ReturnType<Store["getState"]>>(store: Store, selector: (state: State) => Selected, shouldUpdate?: ((pv: Selected, cv: Selected) => boolean) | undefined) => Selected;
declare const createUseAtomSelector: <Store extends AtomStore<{}, {
    action: string;
    payload: Partial<{}>;
}>>(store: Store) => <Selected extends unknown, State extends ReturnType<Store["getState"]>>(selector: (state: State) => Selected, shouldUpdate?: ((pv: Selected, cv: Selected) => boolean) | undefined) => Selected;
export { createAtomStore, useAtomStoreSelector, createUseAtomSelector };
export type { Dispatch, Reducer };
