export interface PatchieOptions {
  logger?: Console["log"];
}

const defineProperty = <V extends any, N extends string | number | symbol>(
  object: Record<N, V>,
  name: N,
  value: V
) => {
  const enumerable =
    !!object[name] &&
    typeof object === "object" &&
    object !== null &&
    object.propertyIsEnumerable(name);

  Object.defineProperty(object, name, {
    enumerable,
    value,
    configurable: true,
    writable: true,
  });
};

const symbols = {
  WRAPPED: Symbol("WRAPPED"),
  ORIGINAL: Symbol("ORIGINAL"),
  WRAP: Symbol("WRAP"),
};

export class Patchie {
  private logger: PatchieOptions["logger"] = console.error.bind(console);

  constructor() {}

  public setOptions(opts?: PatchieOptions) {
    if (opts?.logger) {
      this.logger = opts.logger;
    }
  }

  public wrap<
    T extends Record<string | number | symbol, any>,
    K extends keyof T
  >(nodule: T, name: K, wrapper: (original: T[K]) => T[K]) {
    const original = nodule?.[name];
    if (name && (!nodule || !original)) {
      this.logger?.(`Function ${String(name)} does not exists`);
      return;
    }

    if (typeof wrapper !== "function" && typeof original !== "function") {
      this.logger?.(
        "The wrapper and the original object property must be a function"
      );
      return;
    }

    const wrappedFn = wrapper(original);

    defineProperty(wrappedFn, symbols.ORIGINAL, original);
    defineProperty(wrappedFn, symbols.WRAP, () => {
      if (nodule[name] === wrappedFn) {
        defineProperty(nodule, name, original);
      }
    });

    defineProperty(wrappedFn, symbols.WRAPPED, true);
    defineProperty(nodule, name, wrappedFn);

    return wrappedFn;
  }

  public unwrap<
    T extends Record<string | number | symbol, any>,
    K extends keyof T
  >(nodule: T, name: K) {
    if (!name || !nodule || !nodule[name]) {
      this.logger?.(`Function ${String(name)} doesn't exists`);
      this.logger?.(new Error().stack);
      return;
    }

    if (!nodule[name][symbols.WRAP]) {
      this.logger?.(
        `Function ${String(name)} can't be unwrapped or already unwrapped`
      );
    } else {
      nodule[name][symbols.WRAP]?.();
    }
  }
}

const patchie = new Patchie();
export default patchie;
