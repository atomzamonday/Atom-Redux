import { useLazyRef } from "./utility";
declare type DispatchAction<Type extends string, Payload extends unknown = undefined> = Payload extends undefined ? {
    type: Type;
} : {
    type: Type;
    payload: Payload;
};
declare type DefaultDispatchAction = DispatchAction<string, unknown> | DispatchAction<string, undefined>;
declare type Reducer<State extends {}, Action extends DefaultDispatchAction> = (state: State, action: Action) => State | Promise<State>;
declare class AtomStore<State extends {}, Action extends DefaultDispatchAction> {
    private __state;
    private __reducer;
    private __listenerIds;
    private __listeners;
    constructor(initState: () => State, reducer: Reducer<State, Action>);
    dispatch(action: Action): Promise<void>;
    subscribe(lisenerCallback: (state: State) => any): string;
    unsubscribe(id: string): void;
    getState(): Readonly<State>;
}
declare const createAtomStore: <State extends {}, Action extends DefaultDispatchAction>(initState: () => State, reducer: Reducer<State, Action>) => AtomStore<State, Action>;
declare const useAtomStoreSelector: <Action extends DefaultDispatchAction, Store extends AtomStore<State, Action>, State extends ReturnType<Store["getState"]>, Selected extends unknown = unknown>(store: Store, selector: (state: State) => Selected, shouldUpdate?: ((pv: Selected, cv: Selected) => boolean) | undefined) => Selected;
declare const createUseAtomSelector: <Action extends DefaultDispatchAction, Store extends AtomStore<{}, Action>>(store: Store) => <Selected extends unknown, State extends ReturnType<Store["getState"]>>(selector: (state: State) => Selected, shouldUpdate?: ((pv: Selected, cv: Selected) => boolean) | undefined) => Selected;
export { createAtomStore, useAtomStoreSelector, useLazyRef, createUseAtomSelector, };
export type { DispatchAction, Reducer };
