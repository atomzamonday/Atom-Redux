import { AtomStore, useAtomStoreSelector } from "../dist/index";

const sampleStoreData = {
  username: "",
  password: "",
};

const store = new AtomStore<
  typeof sampleStoreData,
  "update",
  Partial<typeof sampleStoreData>
>(sampleStoreData, (state, { type, payload }) => {
  if (type === "update") {
    return { ...state, ...payload };
  }
  return state;
});

const Input: React.FC = () => {
  const value = useAtomStoreSelector(store, (state) => state.username);

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
