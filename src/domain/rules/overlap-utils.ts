/**
 * Verifica se dois intervalos `[aStart, aEnd]` e `[bStart, bEnd]` se sobrepõem.
 *
 * Dois intervalos sobrepõem-se quando um começa antes do outro terminar.
 */
export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}
