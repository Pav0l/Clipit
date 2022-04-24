export const generateRandomString = () => {
  const uintArr = new Uint16Array(10);
  window.crypto.getRandomValues(uintArr);
  return JSON.stringify(Array.from(uintArr));
};
