interface jwtObject {
  [key: string]: any;
  id?: string;
}

interface Options {
  algorithm?: string;
  secret?: string;
}

export type { jwtObject, Options };
