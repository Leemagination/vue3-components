let zIndex = 2000;

export function createZIndex(domZIndex?: number) {
  if (domZIndex === zIndex - 1) {
    return domZIndex;
  }
  const currentZIndex = zIndex;
  zIndex++;
  return currentZIndex;
}
