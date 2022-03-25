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

export function useWindowLocationInTests() {
  const { location } = window;

  beforeAll((): void => {
    // @ts-ignore
    delete window.location;

    // set default location that was set in jest.config
    setLocationForTests(location.href);
  });

  afterAll((): void => {
    window.location = location;
    window.ethereum = undefined;
  });

  function setLocationForTests(href: string) {
    const url = new URL(href);

    // @ts-ignore
    window.location = {
      href: url.href,
      pathname: url.pathname,
      origin: url.origin,
      hash: url.hash,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      protocol: url.protocol,
      search: url.search,
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn(),
    };
  }

  return setLocationForTests;
}
