/**
 * The Config class represents a base configuration for all SDK methods.
 * It is meant to be extended by more specific configuration classes.
 * @template Args The type of the arguments object, defaulting to an empty object.
 */
export abstract class Config<Args = {}> {
  /**
   * An abstract method to set the configuration from an object.
   * Implementations should take an object and use it to set their own properties.
   * @abstract
   * @param {Object} obj - The object from which to set the configuration.
   */
  abstract setFromObject(obj: {}): void;

  /**
   * An abstract method to build the arguments for the configuration.
   * Implementations should take an object of arguments and return a potentially modified version of it.
   * @abstract
   * @throws {Error} If validation fails.
   * @returns {Args} The potentially modified arguments.
   */
  abstract buildArgs(): Args | never;

  /**
   * An abstract method to validate the current configuration.
   * Implementations should check their properties and throw errors if they are invalid.
   * @abstract
   * @throws {Error} If the configuration is invalid.
   */
  abstract validate(): void | never;
}
