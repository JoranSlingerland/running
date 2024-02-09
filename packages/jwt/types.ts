interface jwtObject {
  [key: string]: any;
}

interface Options {
  algorithm?: string;
  secret?: string;
}

export type { jwtObject, Options };
