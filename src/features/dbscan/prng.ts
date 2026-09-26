import type { Prng, Seed } from './types'

const TWO_POW_32 = 0x1_0000_0000

export function createPrng(seed: Seed): Prng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / TWO_POW_32
  }
}

export function createSeed(): Seed {
  return Math.floor(Math.random() * TWO_POW_32) >>> 0
}

export function pickRandom<T>(items: readonly T[], prng: Prng): T | undefined {
  if (items.length === 0) {
    return undefined
  }
  const index = Math.floor(prng() * items.length)
  return items[index]
}
