import { useState, ChangeEvent } from "react";


export function useInputData()
  : [string, (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, () => void] {
  const [inputData, setInputData] = useState("");

  const inputHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputData(event.target.value);
  };

  const clearInput = () => setInputData("");

  return [inputData, inputHandler, clearInput];
}
