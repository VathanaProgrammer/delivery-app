declare module 'pinia-plugin-persistedstate';

import "pinia"

declare module "pinia" {
  export interface DefineStoreOptions<
    Id extends string,
    S,
    G,
    A
  > {
    persist?: boolean | {
      enabled?: boolean;
      strategies?: Array<{
        key?: string;
        storage?: Storage;
      }>;
    }
  }
}
