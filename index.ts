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
    if (!nodule || !original) {
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

    defineProperty(wrappedFn, "__original", original);
    defineProperty(wrappedFn, "__unwrap", () => {
      if (nodule[name] === wrappedFn) {
        defineProperty(nodule, name, original);
      }
    });

    defineProperty(wrappedFn, "__wrapped", true);
    defineProperty(nodule, name, wrappedFn);

    return wrappedFn;
  }

  public unwrap() {}
}

const patchie = new Patchie();
export default patchie;
