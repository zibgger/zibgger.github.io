// Step 1: Create API token via admin panel API
// Step 2: Use API token to seed content via public REST API

async function main() {
  // Login as admin
  const login = await fetch('http://localhost:1337/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'Admin123456' }),
  }).then(r => r.json());
  const adminToken = login.data.token;

  // Create API token for content management
  const createTok = await fetch('http://localhost:1337/admin/api-tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'seed-token',
      description: 'Token for seeding demo content',
      type: 'full-access',
    }),
  }).then(r => r.json());
  
  const apiToken = createTok.data?.accessKey || '';
  console.log('API Token created:', apiToken ? 'YES' : 'NO');
  console.log('Response:', JSON.stringify(createTok).slice(0, 200));

  if (!apiToken) {
    console.log('Failed to create API token');
    return;
  }

  const H = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  // Delete existing (using public API + API token)
  const oldBlogs = await fetch('http://localhost:1337/api/blogs?pagination[pageSize]=100&status=draft', { headers: H }).then(r => r.json());
  for (const b of (oldBlogs.data || [])) {
    await fetch(`http://localhost:1337/api/blogs/${b.documentId}`, { method: 'DELETE', headers: H });
  }
  
  const oldPfs = await fetch('http://localhost:1337/api/portfolios?pagination[pageSize]=100&status=draft', { headers: H }).then(r => r.json());
  for (const p of (oldPfs.data || [])) {
    await fetch(`http://localhost:1337/api/portfolios/${p.documentId}`, { method: 'DELETE', headers: H });
  }
  
  console.log('Old data cleaned');

  // Create blogs with publishedAt
  const blogs = [
    { title: '如何使用 Astro 构建现代网站', slug: 'astro-guide',
      excerpt: 'Astro 是一个现代化的前端框架，采用"岛屿架构"理念。',
      content: `## 什么是 Astro？\n\nAstro 是一个专为内容型网站设计的**静态站点生成器**。\n\n### 核心概念\n\n1. **岛屿架构** — 零 JS 默认，按需加载\n2. **多框架支持** — React、Vue、Svelte 混用\n3. **SSR 优先** — 极快的首屏速度\n\n> 重新思考：一个网站真正需要多少 JavaScript？`,
      publishedAt: new Date().toISOString() },
    { title: '设计系统入门指南', slug: 'design-system-guide',
      excerpt: '设计系统是确保产品一致性和可维护性的关键工具。',
      content: `## 什么是设计系统？\n\n设计系统是一套**可复用组件**和**明确规范**。\n\n### 核心要素\n\n- **设计原则** — 定义视觉语言与交互模式\n- **组件库** — 可复用的 UI 元素\n- **色彩体系** — 主色、辅色、中性色方案\n- **排版规范** — 字体层级与间距规则\n\n> 好的设计系统是团队协作效率的倍增器。`,
      publishedAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  for (const b of blogs) {
    const res = await fetch('http://localhost:1337/api/blogs', {
      method: 'POST', headers: H, body: JSON.stringify({ data: b }),
    });
    const d = await res.json();
    console.log(`Blog "${b.slug}": ${res.status} ${d.data?.id ? 'OK' : JSON.stringify(d.error || '')}`);
  }

  // Create portfolios
  const pfs = [
    { title: '电商 App 界面设计', slug: 'ecommerce-app',
      description: '为新兴电商平台设计的移动端应用界面，涵盖首页、商品详情、购物车等核心页面。',
      category: 'UI 设计', publishedAt: new Date().toISOString() },
    { title: '企业官网品牌升级', slug: 'brand-upgrade',
      description: '为某科技公司进行官网品牌升级，包括视觉形象重塑和交互体验提升。',
      category: '品牌设计', publishedAt: new Date(Date.now() - 172800000).toISOString() },
    { title: '数据可视化仪表盘', slug: 'dashboard',
      description: '数据分析仪表盘，支持多维度数据展示、实时监控和交互式图表。',
      category: 'Web 应用', publishedAt: new Date(Date.now() - 259200000).toISOString() },
  ];

  for (const p of pfs) {
    const res = await fetch('http://localhost:1337/api/portfolios', {
      method: 'POST', headers: H, body: JSON.stringify({ data: p }),
    });
    const d = await res.json();
    console.log(`Portfolio "${p.slug}": ${res.status} ${d.data?.id ? 'OK' : JSON.stringify(d.error || '')}`);
  }

  // Verify
  const verifyB = await fetch('http://localhost:1337/api/blogs?populate=*').then(r => r.json());
  const verifyP = await fetch('http://localhost:1337/api/portfolios?populate=*').then(r => r.json());
  console.log(`\nFinal: ${verifyB.data?.length || 0} blogs, ${verifyP.data?.length || 0} portfolios`);
}

main().catch(e => console.error('Error:', e.message));
