declare type Action<Type extends string, Payload extends {}> = {
    type: Type;
    payload: Payload;
};
declare type Reducer<State extends {}, ActionType extends string, Payload extends Partial<State>> = (state: State, action: Action<ActionType, Payload>) => State;
declare type AtomStore<State extends {}, ActionType extends string, Payload extends Partial<State>> = {
    dispatch(action: Action<ActionType, Payload>): void;
    subscribe(callback: () => any): string;
    unsubscribe(id: string): void;
    getState(): State;
};
declare const createAtomStore: <State extends {}, ActionType extends string, Payload extends Partial<State>>(initState: State, reducer: Reducer<State, ActionType, Payload>) => AtomStore<State, ActionType, Payload>;
declare const useLazyRef: <T>(lazyInit: () => T) => import("react").MutableRefObject<T>;
declare const useAtomStoreSelector: <Selected extends unknown, Store extends AtomStore<{}, string, Partial<{}>>, State extends ReturnType<Store["getState"]>>(store: Store, selector: (state: State) => Selected, shouldUpdate?: ((pv: Selected, cv: Selected) => boolean) | undefined) => Selected;
export { createAtomStore, useAtomStoreSelector, useLazyRef };
export type { Action, Reducer, AtomStore };
