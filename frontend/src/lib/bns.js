const cache = new Map();

export async function resolveBNS(address) {
  if (cache.has(address)) return cache.get(address);
  try {
    const res = await fetch(`https://api.hiro.so/v1/addresses/stacks/${address}`);
    const data = await res.json();
    const name = data?.names?.[0] ?? null;
    cache.set(address, name);
    return name;
  } catch {
    return null;
  }
}
