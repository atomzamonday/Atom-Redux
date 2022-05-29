import { NonNullableObject, React } from "./type";
export declare namespace Atom {
    type Subscriber<State> = (state: State) => unknown;
    type Reducer<State, Action> = (state: State, action: Action) => Promise<State>;
}
export declare type ReducerAction<Type, Payload = undefined> = {
    type: Type;
} & (Payload extends undefined ? {} : {
    payload: Payload;
});
export declare type Selector<State, Select> = (state: State) => Select;
export declare type ShouldUpdate<Select> = (previous: Select, current: Select) => boolean;
declare class Store<State, Action> {
    private state;
    private reducer;
    private subscribers;
    private runner;
    constructor(initialiseState: () => State, reducer: Atom.Reducer<State, Action>);
    private _dispatch;
    dispatch(action: Action): Promise<void>;
    getState(): State;
    subscribe(subscriber: Atom.Subscriber<State>): string;
    unsubscribe(id: string): void;
}
export declare const createStore: <State, Action>(initialiseState: () => State, reducer: Atom.Reducer<State, Action>) => Store<State, Action>;
export declare const useStoreSelector: <State, Select, Action>(store: Store<State, Action>, selector: Selector<State, Select>, shouldUpdate?: ShouldUpdate<Select> | undefined) => Select;
export declare const createUseSelector: <State, Action>(store: Store<State, Action>) => <Select>(selector: Selector<State, Select>, shouldUpdate?: ShouldUpdate<Select> | undefined) => Select;
export declare const prepareReact: (react: NonNullableObject<React>) => void, REACT: React;
export {};
