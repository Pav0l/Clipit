import { useState, ChangeEvent } from "react";

export function useInputData(
  defaultValue?: string
): [
  string,
  (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => void,
  () => void
] {
  const [inputData, setInputData] = useState(defaultValue ?? "");

  const inputHandler = (
    input: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    if (typeof input === "string") {
      setInputData(input);
    } else {
      setInputData(input.target.value);
    }
  };

  const clearInput = () => setInputData("");

  return [inputData, inputHandler, clearInput];
}
