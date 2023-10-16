# Patchie

**Patchie** is a Type-safe monkey-patching utility for Node.js.

⚠️ Monkey-patching can override the default behavior of a function. Do not monkey-patch unless you know what you are doing.

## API Reference

- `setOptions` -

  Possible Options:

  ```js
  {
    logger: console.log; // You can provide a custom logger here
  }
  ```

- `wrap` - `patchie.wrap(nodule, name, wrapper)`

  - **nodule**: The object containing the property to be wrapped.
  - **name**: The key of the property to be wrapped.
  - **wrapper**: A function that will be used to wrap the original property.

  Returns the wrapped function.

  Suppose you have an object:

  ```js
  const obj = {
    greet: function () {
      console.log("Hello");
    },
  };
  ```

  You can wrap the `greet` function like this:

  ```js
  import patchie from "patchie";

  patchie.wrap(obj, "greet", (original) => {
    return function () {
      console.log("Before greeting");
      original.apply(this, arguments);
      console.log("After greeting");
    };
  });
  ```

  After this, calling `obj.greet()` will print:

  ```
  Before greeting
  Hello
  After greeting
  ```

- `unwrap` - `patchie.unwrap(nodule, name)`

  - **nodule**: The object containing the property to be unwrapped.
  - **name**: The key of the property to be unwrapped.

  Restores the wrapped property to its original state.

  To revert a wrapped function back to its original form:

  ```js
  patchie.unwrap(obj, "greet");
  ```

## Credits:

- [shimmer.js](https://github.com/othiym23/shimmer/tree/master) - Patchie is heavily inspired by the shimmer package. Shimmer is unmaintained for last 5 years and have few minor edge cases.
