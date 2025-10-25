export const roundTo2Digits = (x: number) => Math.round((x + Number.EPSILON) * 100.0) / 100.0;
export const roundTo3Digits = (x: number) => Math.round((x + Number.EPSILON) * 1000.0) / 1000.0;
export const roundTo4Digits = (x: number) => Math.round((x + Number.EPSILON) * 10000.0) / 10000.0;
export const infinityToEmpty = (x: number) => (x === Infinity || x === -Infinity ? "" : x);
export const shortNumber = (x: number) => {
  if (x > 1e27) return `${roundTo2Digits(x / 1e27)}Oc`;
  else if (x > 1e24) return `${roundTo2Digits(x / 1e24)}Sp`;
  else if (x > 1e21) return `${roundTo2Digits(x / 1e21)}Sx`;
  else if (x > 1e18) return `${roundTo2Digits(x / 1e18)}Qi`;
  else if (x > 1e15) return `${roundTo2Digits(x / 1e15)}Qa`;
  else if (x > 1e12) return `${roundTo2Digits(x / 1e12)}T`;
  else if (x > 1e9) return `${roundTo2Digits(x / 1e9)}B`;
  else if (x > 1e6) return `${roundTo2Digits(x / 1e6)}M`;
  else if (x > 1e3) return `${roundTo2Digits(x / 1e3)}k`;
  else return `${roundTo2Digits(x)}`;
};
