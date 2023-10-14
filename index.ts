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
  WRAPPED: Symbol("WRAPPED"), // Symbol indicating that a function or property has been wrapped.
  ORIGINAL: Symbol("ORIGINAL"), // Symbol used to store the original version of the function or property prior to wrapping.
  UNWRAP: Symbol("UNWRAP"), // Symbol pointing to a function that undoes the wrap, restoring the original function or property.
};

export class Patchie {
  private logger: PatchieOptions["logger"] = console.error.bind(console);

  constructor() {}

  public setOptions(opts?: PatchieOptions) {
    if (opts?.logger) {
      this.logger = opts.logger;
    }
  }

  /**
   * @description Wraps a property (typically a function) of a given object (nodule) with a provided wrapper function.
   *
   * @param {T} nodule - The object containing the property to be wrapped.
   * @param {K} name - The key of the property to be wrapped.
   * @param {(original: T[K]) => T[K]} wrapper - The function that will be used to wrap the original property.
   *
   * @returns {T[K]} The wrapped function.
   */
  public wrap<
    T extends Record<string | number | symbol, any>,
    K extends keyof T
  >(nodule: T, name: K, wrapper: (original: T[K]) => T[K]) {
    // Retrieve the original property from the object using the given key.
    const original = nodule?.[name];

    // If the object doesn't exist or doesn't have the given property, log an error and exit.
    if (name && (!nodule || !original)) {
      this.logger?.(`Function ${String(name)} does not exists`);
      return;
    }

    // If neither the wrapper nor the original property is a function, log an error and exit.
    if (typeof wrapper !== "function" && typeof original !== "function") {
      this.logger?.(
        "The wrapper and the original object property must be a function"
      );
      return;
    }

    // Create the wrapped function by invoking the wrapper with the original function.
    const wrappedFn = wrapper(original);

    // Add a property to the wrapped function to store the original function for later reference.
    defineProperty(wrappedFn, symbols.ORIGINAL, original);

    // Add a property to the wrapped function that allows the object to be restored to its original state.
    defineProperty(wrappedFn, symbols.UNWRAP, () => {
      if (nodule[name] === wrappedFn) {
        defineProperty(nodule, symbols.WRAPPED, false);
        defineProperty(nodule, name, original);
      }
    });

    // Mark the wrapped function as wrapped.
    defineProperty(wrappedFn, symbols.WRAPPED, true);
    // Replace the original property on the object with the wrapped function.
    defineProperty(nodule, name, wrappedFn);

    return wrappedFn;
  }

  /**
   * @description Unwraps a previously wrapped property (typically a function) of a given object (nodule).
   * If the property was wrapped using the wrap function, it will be restored to its original state.
   *
   * @param {T} nodule - The object containing the property to be unwrapped.
   * @param {K} name - The key of the property to be unwrapped.
   */
  public unwrap<
    T extends Record<string | number | symbol, any>,
    K extends keyof T
  >(nodule: T, name: K) {
    // Check for the existence of the object and its property.
    if (!name || !nodule || !nodule[name]) {
      this.logger?.(`Function ${String(name)} doesn't exists`);
      this.logger?.(new Error().stack);
      return;
    }

    // Check if the property has the UNWRAP symbol associated with it.
    if (!nodule[name][symbols.UNWRAP]) {
      this.logger?.(
        `Function ${String(name)} can't be unwrapped or already unwrapped`
      );
    } else {
      // Call the UNWRAP function to restore the original property.
      nodule[name][symbols.UNWRAP]?.();
    }
  }
}

const patchie = new Patchie();
export default patchie;
