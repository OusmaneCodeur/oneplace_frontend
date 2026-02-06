/**
 * Retourne l'URL complète pour une image produit (stockée côté backend dans /uploads).
 * baseURL = REACT_APP_API_URL sans le segment /api (ex: http://localhost:5011).
 */
export function getProductImageUrl(image) {
  if (!image) return "/logo192.png";
  if (image.startsWith("http")) return image;
  const base = (process.env.REACT_APP_API_URL || "")
    .replace(/\/api\/?$/, "")
    .trim();
  const path = image.startsWith("/") ? image : `/${image}`;
  return base ? `${base}${path}` : path;
}
