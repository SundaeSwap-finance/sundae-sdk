export function liquidityInvariant(
  assetA: bigint,
  assetB: bigint,
  linearAmplification: bigint,
  newSumInvariant: bigint,
) {
  // 4 * A * 4 * (x*y) * D + D^3 - (4(x*y) * (4A(x + y) + D))
  // 4A * 4xy * D + D^3 - (4xy * 4a * (x + y) + 4xy * D)
  // 16Axy * D + D^3 - (16Axy * (x + y) + 4xy * D)
  const four_a = 4n * linearAmplification;
  const four_x_y = 4n * assetA * assetB;
  const d_plus_one = newSumInvariant + 1n;
  const d_cubed = newSumInvariant * newSumInvariant * newSumInvariant;
  const d_plus_one_cubed = d_plus_one * d_plus_one * d_plus_one;
  const x_plus_y = assetA + assetB;
  const sixteen_a_x_y = four_a * four_x_y;
  const sixteen_a_x_y_x_plus_y = sixteen_a_x_y * x_plus_y;
  const f1 =
    sixteen_a_x_y * newSumInvariant +
    d_cubed -
    (sixteen_a_x_y_x_plus_y + four_x_y * newSumInvariant);
  const f2 =
    sixteen_a_x_y * d_plus_one +
    d_plus_one_cubed -
    (sixteen_a_x_y_x_plus_y + four_x_y * d_plus_one);
  return f1 <= 0n && f2 > 0n;
}

export const aPrecision = 200n;
export const reservePrecision = 1_000_000_000_000n;

export function getSumInvariant(a: bigint, x: bigint, y: bigint): bigint {
  if (a <= 0n) {
    throw new Error("Amplification coefficient must be positive.");
  }
  x = x * reservePrecision;
  y = y * reservePrecision;
  a = a * aPrecision;
  const sum: bigint = x + y;
  if (sum === 0n) {
    return 0n;
  }

  let d = sum;
  const ann = a * 2n;
  for (let i = 0; i < 255; i++) {
    const d_p = (d * d * d) / (4n * x * y);
    const d_prev = d;

    d =
      (((ann * sum) / 100n + d_p * 2n) * d) /
      (((ann - 100n) * d) / 100n + 3n * d_p);

    if (d > d_prev) {
      if (d - d_prev <= 1) {
        if (liquidityInvariant(x, y, a / aPrecision, d)) {
          return d;
        } else {
          return d - 1n;
        }
      }
    } else {
      if (d_prev - d <= 1) {
        if (liquidityInvariant(x, y, a / aPrecision, d)) {
          return d;
        } else {
          return d - 1n;
        }
      }
    }
  }
  throw new Error("Failed to converge on D value after 255 iterations.");
}

export function getNewY(
  newX: bigint,
  aRaw: bigint,
  sumInvariant: bigint,
): bigint {
  newX = newX * reservePrecision;
  const sum = newX;
  let yPrev = 0n;
  let c = sumInvariant;
  const ann = aRaw * aPrecision * 2n;

  c = (c * sumInvariant) / (newX * 2n);
  c = (c * sumInvariant * aPrecision) / 2n;
  c = c / (ann * 2n);
  const b = sum + (sumInvariant * aPrecision) / 2n / ann;
  let y = sumInvariant;
  for (let i = 0; i < 255; i++) {
    yPrev = y;
    y = (y * y + c) / (y * 2n + b - sumInvariant);
    if (y > yPrev) {
      if (y - yPrev <= 1n) {
        if (liquidityInvariant(newX, y, aRaw, sumInvariant)) {
          return y;
        } else {
          return y + 1n;
        }
      }
    } else {
      if (yPrev - y <= 1n) {
        if (liquidityInvariant(newX, y, aRaw, sumInvariant)) {
          return y;
        } else {
          return y + 1n;
        }
      }
    }
  }
  throw new Error("failed to converge on y value after 255 iterations.");
}
