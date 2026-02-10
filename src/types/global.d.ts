/// <reference types="node" />

declare namespace NodeJS {
  interface Timeout {}
}

declare const process: {
  env: Record<string, string | undefined>;
};
