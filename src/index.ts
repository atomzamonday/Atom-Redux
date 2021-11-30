import { pubsub } from "atom-pubsub";
import { useState, useEffect, useRef } from "react";
import Deepclone from "rfdc";
import { nanoid } from "nanoid";

const deepclone = Deepclone({
  proto: true,
  circles: false,
});

type Action<Type extends string, Payload extends {}> = {
  type: Type;
  payload: Payload;
};
type Reducer<
  State extends {},
  ActionType extends string,
  Payload extends Partial<State>
> = (state: State, action: Action<ActionType, Payload>) => State;

class AtomStore<
  State extends {},
  ActionType extends string,
  Payload extends Partial<State>
> {
  private __state: State;
  private __reducer: Reducer<State, ActionType, Payload>;
  private __pubid: string;

  constructor(initState: State, reducer: Reducer<State, ActionType, Payload>) {
    this.__state = initState;
    this.__reducer = reducer;
    this.__pubid = nanoid();
  }

  dispatch(action: Action<ActionType, Payload>) {
    this.__state = this.__reducer(this.__state, action);
    pubsub.publish(this.__pubid);
  }

  subscribe(callback: () => any) {
    return pubsub.subscribe(this.__pubid, callback);
  }

  unsubscribe(id: string) {
    pubsub.unsubscribe(id);
  }

  getState() {
    return Object.freeze(deepclone(this.__state));
  }
}

const createAtomStore = <
  State extends {},
  ActionType extends string,
  Payload extends Partial<State>
>(
  initState: State,
  reducer: Reducer<State, ActionType, Payload>
): AtomStore<State, ActionType, Payload> => {
  return new AtomStore(initState, reducer);
};

const useLazyRef = <T>(lazyInit: () => T) => {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = lazyInit();
  }
  return ref as React.MutableRefObject<T>;
};

const useAtomStoreSelector = <
  Selected extends unknown,
  Store extends AtomStore<{}, string, Partial<{}>>,
  State extends ReturnType<Store["getState"]>
  // Store extends AtomStore<{}, string, Partial<{}>>,
  // State extends ReturnType<Store["getState"]>
>(
  store: Store,
  selector: (state: State) => Selected,
  shouldUpdate?: (pv: Selected, cv: Selected) => boolean
) => {
  const [value, setValue] = useState(() =>
    selector(store.getState() as unknown as State)
  );
  const preVal = useLazyRef(() =>
    selector(store.getState() as unknown as State)
  );

  useEffect(() => {
    const id = store.subscribe(() => {
      const currentVal = selector(store.getState() as unknown as State);
      if (
        shouldUpdate !== undefined &&
        shouldUpdate(preVal.current, currentVal) === false
      ) {
        return;
      }
      preVal.current = currentVal;
      setValue(() => currentVal);
    });

    return () => {
      store.unsubscribe(id);
    };
  }, []);

  return value;
};

export { createAtomStore, useAtomStoreSelector, useLazyRef };
export type { Action, Reducer };
