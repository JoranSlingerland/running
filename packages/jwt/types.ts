interface jwtObject {
  [key: string]: unknown;
  id?: string;
}

interface Options {
  algorithm?: string;
  secret?: string;
}

export type { jwtObject, Options };
