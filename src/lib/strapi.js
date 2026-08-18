const API_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

export async function fetchAPI(path) {
  try {
    const url = `${API_URL}/api${path}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`[Strapi] ${url} → ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[Strapi] Request failed:`, err.message);
    return null;
  }
}

export async function getBlogs() {
  const data = await fetchAPI('/blogs?populate=*&sort=publishedAt:desc&filters[publishedAt][$notNull]=true');
  return data?.data || [];
}

export async function getBlog(slug) {
  const data = await fetchAPI(`/blogs?filters[slug][$eq]=${slug}&populate=*`);
  return data?.data?.[0] || null;
}

export async function getPortfolios() {
  const data = await fetchAPI('/portfolios?populate=*&sort=publishedAt:desc&filters[publishedAt][$notNull]=true');
  return data?.data || [];
}

export async function getPortfolio(slug) {
  const data = await fetchAPI(`/portfolios?filters[slug][$eq]=${slug}&populate=*`);
  return data?.data?.[0] || null;
}

export function getImageUrl(image) {
  if (!image) return '';
  const url = image.url || image.formats?.large?.url || image.formats?.medium?.url || image.formats?.small?.url;
  return url ? `${API_URL}${url}` : '';
}
