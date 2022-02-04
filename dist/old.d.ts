import { useLazyRef } from "./utility";
declare type Action<Type extends string, Payload extends {}> = {
    type: Type;
    payload: Payload;
};
declare type Reducer<State extends {}, ActionType extends string, Payload extends Partial<State>> = (state: State, action: Action<ActionType, Payload>) => State;
declare class AtomStore<State extends {}, ActionType extends string, Payload extends Partial<State>> {
    private __state;
    private __reducer;
    private __listenerIds;
    private __listeners;
    constructor(initState: State, reducer: Reducer<State, ActionType, Payload>);
    dispatch(action: Action<ActionType, Payload>): void;
    subscribe(lisenerCallback: (state: State) => any): string;
    unsubscribe(id: string): void;
    getState(): Readonly<State>;
}
declare const createAtomStore: <State extends {} = {}, ActionType extends string = string, Payload extends Partial<State> = Partial<State>>(initState: State, reducer: Reducer<State, ActionType, Payload>) => AtomStore<State, ActionType, Payload>;
declare const useAtomStoreSelector: <Selected extends unknown, Store extends AtomStore<{}, string, Partial<{}>>, State extends ReturnType<Store["getState"]>>(store: Store, selector: (state: State) => Selected, shouldUpdate?: ((pv: Selected, cv: Selected) => boolean) | undefined) => Selected;
declare const createUseAtomSelector: <Store extends AtomStore<{}, string, Partial<{}>>>(store: Store) => <Selected extends unknown, State extends ReturnType<Store["getState"]>>(selector: (state: State) => Selected, shouldUpdate?: ((pv: Selected, cv: Selected) => boolean) | undefined) => Selected;
export { createAtomStore, useAtomStoreSelector, useLazyRef, createUseAtomSelector, };
export type { Action, Reducer };
