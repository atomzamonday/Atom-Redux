import { useState, useEffect } from "react";
import { deepclone, useLazyRef } from "./utility";
import { nanoid } from "nanoid";

type Dispatch<
  Payload extends {} | undefined = undefined,
  Action extends string | undefined = undefined
> = Action extends undefined
  ? Payload extends undefined
    ? undefined
    : {
        payload: Payload;
      }
  : Payload extends undefined
  ? {
      action: Action;
    }
  : {
      action: Action;
      payload: Payload;
    };

export type DefaultDispatch<
  Payload extends {} | undefined,
  Action extends string | undefined
> =
  | Dispatch<Payload, Action>
  | Dispatch<Payload, undefined>
  | Dispatch<undefined, Action>
  | Dispatch;

type Reducer<
  State extends {},
  Dispatching extends DefaultDispatch<Partial<State>, string>
> = (state: State, dispatch: Dispatching) => State;

class AtomStore<
  State extends {},
  Dispatching extends DefaultDispatch<Partial<State>, string>
> {
  private __state: State;
  private __reducer: Reducer<State, Dispatching>;
  private __listenerIds: string[] = [];
  private __listeners: {
    [id: string]: (state: State) => void;
  } = {};

  constructor(initState: State, reducer: Reducer<State, Dispatching>) {
    this.__state = initState;
    this.__reducer = reducer;
  }

  dispatch(action: Dispatching) {
    this.__state = this.__reducer(this.__state, action);
    this.__listenerIds.forEach((id) => {
      const listener = this.__listeners[id];
      if (listener !== undefined) {
        listener(this.getState());
      }
    });
  }

  subscribe(lisenerCallback: (state: State) => any) {
    const id = nanoid();
    this.__listenerIds.push(id);
    this.__listeners[id] = lisenerCallback;
    return id;
  }

  unsubscribe(id: string) {
    this.__listenerIds = this.__listenerIds.filter(
      (listenerId) => id !== listenerId
    );
    this.__listeners[id] = null as unknown as (state: State) => any;
  }

  getState() {
    return Object.freeze(deepclone(this.__state)) as State;
  }
}

const createAtomStore = <
  State extends {},
  Dispatching extends DefaultDispatch<Partial<State>, string>
>(
  initState: State,
  reducer: Reducer<State, Dispatching>
): AtomStore<State, Dispatching> => {
  return new AtomStore(initState, reducer);
};

const shallowShouldUpdate = <Obj extends unknown>(pv: Obj, cv: Obj) =>
  pv !== cv;

const useAtomStoreSelector = <
  Selected extends unknown,
  Store extends AtomStore<State, DefaultDispatch<Partial<State>, string>>,
  State extends ReturnType<Store["getState"]>
>(
  store: Store,
  selector: (state: State) => Selected,
  shouldUpdate?: (pv: Selected, cv: Selected) => boolean
) => {
  const [value, setValue] = useState(() =>
    selector(store.getState() as unknown as State)
  );
  const ref = useLazyRef(() => ({
    preVal: selector(store.getState() as unknown as State),
    mounted: false,
  }));

  useEffect(() => {
    ref.current.mounted = true;
    const __shouldUpdate = shouldUpdate || shallowShouldUpdate;
    const id = store.subscribe(() => {
      const currentVal = selector(store.getState() as unknown as State);
      if (__shouldUpdate(ref.current.preVal, currentVal) === false) {
        return;
      }
      ref.current.preVal = currentVal;
      if (ref.current.mounted) {
        setValue(() => currentVal);
      }
    });

    return () => {
      ref.current.mounted = false;
      store.unsubscribe(id);
    };
  }, []);

  return value;
};

const createUseAtomSelector = <
  State extends {},
  Store extends AtomStore<State, DefaultDispatch<Partial<State>, string>>
>(
  store: Store
) => {
  return <
    Selected extends unknown,
    State extends ReturnType<Store["getState"]>
  >(
    selector: (state: State) => Selected,
    shouldUpdate?: (pv: Selected, cv: Selected) => boolean
  ) =>
    //@ts-ignore
    useAtomStoreSelector<Selected, Store, State>(store, selector, shouldUpdate);
};

export { createAtomStore, useAtomStoreSelector, createUseAtomSelector };
export type { Dispatch, Reducer };

const g = <
  State extends {},
  Store extends AtomStore<State, DefaultDispatch<Partial<State>, string>>
>(
  store: Store
) => {
  return store.getState();
};

const s = createAtomStore<
  { x: string },
  DefaultDispatch<Partial<{ x: string }>, string>
>({ x: "" }, (state) => state);

const u = g(s);
