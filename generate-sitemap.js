import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import 'dotenv/config'; 

// distinct from your src/lib/supabase.ts because this runs in Node
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DOMAIN = 'https://onium.store';

async function generateSitemap() {
  // 1. Static Pages
  const pages = ['', '/products', '/about', '/contact', '/faq', '/shipping-policy', '/return-policy', '/track-order'];
  
  // 2. Fetch Dynamic Product Slugs (Changed from IDs)
  // We select 'slug' and 'updated_at' to build the correct links
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at'); 

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
    <url>
      <loc>${DOMAIN}${page}</loc>
      <changefreq>weekly</changefreq>
      <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
  ${products?.map(product => `
    <url>
      <loc>${DOMAIN}/product/${product.slug}</loc>
      <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>
  `).join('') || ''}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log('✅ Sitemap generated in public/sitemap.xml');
}

generateSitemap();