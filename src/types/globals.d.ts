// src/types/globals.d.ts

// Pinia store persist
declare module 'pinia-plugin-persistedstate' {
  import "pinia";
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
}

// Iconify Vue
declare module '@iconify/vue' {
  import { DefineComponent } from 'vue';
  export const Icon: DefineComponent<{}, {}, any>;
}

// Vue Google Maps
declare module '@fawmi/vue-google-maps' {
  import { Plugin } from 'vue';
  const plugin: Plugin;
  export default plugin;
}

declare module 'qrcode';

declare module 'jsqr' {
  interface QRCode {
    binaryData?: Uint8ClampedArray;
    data: string;
    chunks?: any[];
  }

  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' }
  ): QRCode | null;

  export default jsQR;
}
