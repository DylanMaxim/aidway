export function generateCampCode() {
  const value = Math.floor(Math.random() * 0xffffff);
  return value.toString(16).toUpperCase().padStart(6, "0");
}
