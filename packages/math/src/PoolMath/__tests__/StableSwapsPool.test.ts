import {
  getNewY,
  getSumInvariant,
  liquidityInvariant,
  reservePrecision,
} from "../StableSwapsPool";

describe("liquidityInvariant()", () => {
  test("Should be true for normal balanced case", () => {
    expect(
      liquidityInvariant(
        20_000_000n * reservePrecision,
        20_000_000n * reservePrecision,
        200n,
        40000000000000000000n,
      ),
    ).toBeTruthy();
  });

  const rawSwap = 9999750604846068206n;

  test("Should be true after a swap", () => {
    expect(
      liquidityInvariant(
        1010000000n * reservePrecision,
        1000000000n * reservePrecision - rawSwap,
        200n,
        2000000000000000000000n,
      ),
    ).toBeTruthy();
  });

  test("Should be false after a swap minus 1", () => {
    expect(
      liquidityInvariant(
        1010000000n * reservePrecision,
        1000000000n * reservePrecision - rawSwap - 1n,
        200n,
        2000000000000000000000n,
      ),
    ).toBeFalsy();
  });

  test("Should be false after a swap plus 1", () => {
    expect(
      liquidityInvariant(
        1010000000n * reservePrecision,
        1000000000n * reservePrecision - rawSwap + 1n,
        200n,
        2000000000000000000000n,
      ),
    ).toBeFalsy();
  });
});

describe("getSumInvariant()", () => {
  test("Should return correct in balanced case", () => {
    expect(getSumInvariant(200n, 20_000_000n, 20_000_000n)).toEqual(
      40000000000000000000n,
    );
  });
  test("Should return correct in unbalanced case", () => {
    expect(getSumInvariant(200n, 1010000000n, 1000000000n - 9999750n)).toEqual(
      2000000000604861229903n,
    );
  });
});

describe("getNewY()", () => {
  const sumInvariant = 2000000000000000000000n;
  const rawSwap = 9999750604846068206n;
  const newX = 1010000000n;
  const oldY = 1000000000n;
  test("Should find the correct swap amount", () => {
    const newY = getNewY(newX, 200n, sumInvariant);
    expect(newY).toEqual(oldY * reservePrecision - rawSwap);
  });
});
