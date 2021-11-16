declare type Action<Type extends string, Payload extends {}> = {
    type: Type;
    payload: Payload;
};
declare type Reducer<State extends {}, ActionType extends string, Payload extends Partial<State>> = (state: State, action: Action<ActionType, Payload>) => State;
declare class AtomStore<State extends {}, ActionType extends string, Payload extends Partial<State>> {
    #private;
    constructor(initState: State, reducer: Reducer<State, ActionType, Payload>);
    dispatch(action: Action<ActionType, Payload>): void;
    subscribe(callback: () => any): string;
    unsubscribe(id: string): void;
    getState(): State;
}
declare const useAtomStoreSelector: <Store extends AtomStore<{}, string, Partial<{}>>, State extends ReturnType<Store["getState"]>>(store: Store, selector: (state: State) => State[keyof State]) => State[keyof State];
export { AtomStore, useAtomStoreSelector };
export type { Action, Reducer };
