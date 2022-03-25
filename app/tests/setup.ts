/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import { randomFillSync } from "crypto";

/**
 * @dev console.log is disabled in tests. use `console.debug` to log output into terminal in tests
 */
console.log = function () {
  /* disable in tests */
};

/**
 * @dev console.error is disabled in tests. use `console.debug` to log output into terminal in tests
 */
console.error = function () {
  /* disable in tests */
};

Object.defineProperty(globalThis, "crypto", {
  value: { getRandomValues: randomFillSync },
});
