/** @license
 * Harps (https://stackoverflow.com/users/1073588/harps) TypeScript adaptation of work by
 * broofa (https://stackoverflow.com/users/109538)
 * https://stackoverflow.com/a/2117523
 * cc by-sa 4.0 with attribution required
 * Modified to create string without dashes
 */
export function createPseudoGUID(withDashes = false): string {
  const baseString = withDashes
    ? "" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11
    : "" + 1e7 + 1e3 + 4e3 + 8e3 + 1e11;
  return baseString.replace(
    /[018]/g,
    (c: any) =>
      // tslint:disable: no-bitwise
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    // tslint:enable: no-bitwise
  );
}
