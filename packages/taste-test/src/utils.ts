import { Data, UTxO } from "lucid-cardano";

import { SetNode } from "./@types/contracts";

/**
 * Finds the UTxO node that covers a given user key.
 *
 * @param {UTxO[]} utxos - An array of UTxO objects to search through.
 * @param {string} userKey - The user key to find the covering node for.
 * @returns {UTxO|undefined} - The covering UTxO node, or undefined if no covering node is found.
 *
 * @example
 * const utxos = [...]; // your array of UTxO objects
 * const userKey = 'someUserKey';
 * const coveringNode = findCoveringNode(utxos, userKey);
 */
export const findCoveringNode = (utxos: UTxO[], userKey: string) =>
  utxos.find((value) => {
    if (!value.datum) {
      return false;
    }

    const datum = Data.from(value.datum, SetNode);
    return (
      (datum.key == null || datum.key < userKey) &&
      (datum.next == null || userKey < datum.next)
    );
  });

/**
 * Searches through a list of UTXOs to find a node owned by the user, identified by a specific key.
 *
 * @param {UTxO[]} utxos - An array of unspent transaction outputs (UTXOs).
 * @param {string} userKey - The unique identifier key for the user, used to find a specific node in the UTXOs.
 * @returns {UTxO | undefined} - Returns the UTXO that contains the user's node if found, otherwise returns undefined.
 *
 * This function iterates through the provided `utxos`, attempting to match the `userKey` with a key within the datum of each UTXO.
 * If a match is found, it indicates that the UTXO belongs to the user's node, and this UTXO is returned.
 * If no matching node is found in the list of UTXOs, the function returns undefined, indicating the user's node was not found.
 */
export const findOwnNode = (utxos: UTxO[], userKey: string) =>
  utxos.find((value) => {
    if (!value.datum) {
      return false;
    }

    const nodeData = Data.from(value.datum, SetNode);
    return nodeData.key == userKey;
  });

/**
 * Searches through a list of UTXOs to find a node owned by the user, identified by a specific key, and return the next reference (previous to the user's node).
 *
 * @param {UTxO[]} utxos - An array of unspent transaction outputs (UTXOs).
 * @param {string} userKey - The unique identifier key for the user, used to find a specific node in the UTXOs.
 * @returns {UTxO | undefined} - Returns the UTXO that contains the previous node of the user's node if found, otherwise returns undefined.
 *
 * This function iterates through the provided `utxos`, attempting to match the `userKey` with a key within the datum of each UTXO.
 * If a match is found, it indicates that the UTXO belongs to the user's node, and the UTXO referenced as the previous node is returned.
 * If no matching node is found in the list of UTXOs, the function returns undefined, indicating the previous node of the user's node was not found.
 */
export const findPrevNode = (utxos: UTxO[], userKey: string) =>
  utxos.find((value) => {
    if (!value.datum) {
      return false;
    }

    const datum = Data.from(value.datum, SetNode);
    return datum.next !== null && datum.next == userKey;
  });

/**
 * Performs a division operation on two bigints and rounds up the result.
 *
 * This function takes two bigint numbers, divides the first by the second, and rounds up the result.
 * The rounding up ensures the result is the smallest integer greater than or equal to the actual division result,
 * often used when dealing with scenarios where fractional results are not acceptable, and rounding up is required.
 *
 * Note: This function does not handle cases where 'b' is zero. Zero as the divisor will lead to an error as division by zero is not defined.
 *
 * @param {bigint} a - The dividend represented as a bigint.
 * @param {bigint} b - The divisor represented as a bigint.
 * @returns {bigint} - The result of the division, rounded up to the nearest bigint.
 */
export const divCeil = (a: bigint, b: bigint) => {
  return 1n + (a - 1n) / b;
};
