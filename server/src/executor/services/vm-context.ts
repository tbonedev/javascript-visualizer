export const createSafeContext = (): Record<string, unknown> => {
  return {
    // Console for output
    console: console,

    // Math utilities
    Math: Math,

    // Data structures
    Array: Array,
    Object: Object,
    Map: Map,
    Set: Set,
    WeakMap: WeakMap,
    WeakSet: WeakSet,

    // Primitives
    String: String,
    Number: Number,
    Boolean: Boolean,
    Symbol: Symbol,
    BigInt: BigInt,

    // Utilities
    JSON: JSON,
    Date: Date,
    RegExp: RegExp,

    // Global functions
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,

    // Typed Arrays
    Int8Array: Int8Array,
    Uint8Array: Uint8Array,
    Int16Array: Int16Array,
    Uint16Array: Uint16Array,
    Int32Array: Int32Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
    BigInt64Array: BigInt64Array,
    BigUint64Array: BigUint64Array,

    // Promise for async
    Promise: Promise,

    // Timers для async
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval,

    // Microtask
    queueMicrotask: queueMicrotask,

    // Special values
    undefined: undefined,
    NaN: NaN,
    Infinity: Infinity,

    // Error types
    Error: Error,
    TypeError: TypeError,
    RangeError: RangeError,
    ReferenceError: ReferenceError,
    SyntaxError: SyntaxError,
  };
};
