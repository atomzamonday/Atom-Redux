import { createAtomStore, useAtomStoreSelector } from "../dist/index";

type SampleData = {
  username: string;
  password: string;
  age: number;
};

const sampleStoreData: SampleData = {
  username: "",
  password: "",
  age: 99,
};

const store = createAtomStore<SampleData, "update", Partial<SampleData>>(
  sampleStoreData,
  (state, { type, payload }) => {
    if (type === "update") {
      return { ...state, ...payload };
    }
    return state;
  }
);

const Input: React.FC = () => {
  const value = useAtomStoreSelector(store, (state) => state.password);

  return (
    <input
      value={value}
      onChange={(e) => {
        store.dispatch({
          type: "update",
          payload: { username: e.target.value },
        });
      }}
    />
  );
};
