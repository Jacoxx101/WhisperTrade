/// <reference types="node" />

declare namespace NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Timeout {}
}

declare const process: {
  env: Record<string, string | undefined>;
};
