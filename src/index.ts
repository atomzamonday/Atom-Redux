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
  #state: State;
  #reducer: Reducer<State, ActionType, Payload>;
  #pubId: string;

  constructor(initState: State, reducer: Reducer<State, ActionType, Payload>) {
    this.#state = initState;
    this.#reducer = reducer;
    this.#pubId = nanoid();
  }

  dispatch(action: Action<ActionType, Payload>) {
    this.#state = this.#reducer(this.#state, action);
    pubsub.publish(this.#pubId);
  }

  subscribe(callback: () => any) {
    return pubsub.subscribe(this.#pubId, callback);
  }

  unsubscribe(id: string) {
    pubsub.unsubscribe(id);
  }

  getState() {
    return deepclone(this.#state);
  }
}

const useLazyRef = <T>(lazyInit: () => T) => {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = lazyInit();
  }
  return ref as React.MutableRefObject<T>;
};

const useAtomStoreSelector = <
  Store extends AtomStore<{}, string, Partial<{}>>,
  State extends ReturnType<Store["getState"]>
>(
  store: Store,
  selector: (state: State) => State[keyof State],
  shouldUpdate?: (pv: State[keyof State], cv: State[keyof State]) => boolean
) => {
  // @ts-ignore
  const [value, setValue] = useState(() => selector(store.getState()));
  // @ts-ignore
  const preVal = useLazyRef(() => selector(store.getState()));

  useEffect(() => {
    const id = store.subscribe(() => {
      //@ts-ignore
      const currentVal = selector(store.getState());
      if (shouldUpdate !== undefined) {
        if (shouldUpdate(preVal.current, currentVal) === false) {
          return;
        }
      }
      preVal.current = currentVal;
      //@ts-ignore
      setValue(() => currentVal);
    });

    return () => {
      store.unsubscribe(id);
    };
  }, []);

  return value;
};

export { AtomStore, useAtomStoreSelector };
export type { Action, Reducer };
