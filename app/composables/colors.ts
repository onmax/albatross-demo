export const colors = ['blue', 'gold', 'orange', 'red', 'purple', 'pink', 'green'].map(c => `rgb(var(--nq-${c}))`)

export function getColorByHash(hash: string) {
  return colors[Number.parseInt(hash, 16) % colors.length]
}

export function getColorByNonce(nonce: number) {
  return colors[nonce % colors.length]
}
