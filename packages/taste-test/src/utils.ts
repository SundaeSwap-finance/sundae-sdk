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
