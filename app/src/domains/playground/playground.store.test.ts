import { TestStore } from "./playground.store";

it("tests", () => {
  const store = new TestStore();
  expect(store.yesText).toEqual("yes text!");
});
