export function getColorByHash(hash: string) {
  return colors[Number.parseInt(hash, 16) % colors.length]
}

export function getColorByNonce(nonce: number) {
  return colors[nonce % colors.length]
}
