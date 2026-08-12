import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Auto-configure public permissions for Blog and Portfolio
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (publicRole) {
      const publicPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
        where: { role: { id: publicRole.id } },
      });

      const existingActions = publicPermissions.map((p: any) => p.action);

      // Permissions needed
      const neededPermissions = [
        'api::blog.blog.find',
        'api::blog.blog.findOne',
        'api::portfolio.portfolio.find',
        'api::portfolio.portfolio.findOne',
      ];

      for (const action of neededPermissions) {
        if (!existingActions.includes(action)) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: publicRole.id,
            },
          });
          strapi.log.info(`✅ Granted public permission: ${action}`);
        }
      }
    }

    // Seed demo data if no blogs exist
    const allBlogs = await strapi.db.query('api::blog.blog').findMany({ limit: 1 });
    if (allBlogs.length === 0) {
      strapi.log.info('🌱 Seeding demo data...');

      await strapi.documents('api::blog.blog').create({
        data: {
          title: '如何使用 Astro 构建现代网站',
          slug: 'astro-guide',
          excerpt: 'Astro 是一个现代化的前端框架，采用"岛屿架构"理念，显著提升网站性能。',
          content: `## 什么是 Astro？

Astro 是一个专为内容型网站设计的**静态站点生成器**。

### 核心概念

1. **岛屿架构** — 零 JS 默认，按需加载交互组件
2. **多框架支持** — React、Vue、Svelte 可混用
3. **SSR 优先** — 极快的首屏加载速度

> 重新思考：一个网站真正需要多少 JavaScript？

\`npm create astro@latest\` 即可开始！`,
        },
        status: 'published',
      });

      await strapi.documents('api::blog.blog').create({
        data: {
          title: '设计系统入门指南',
          slug: 'design-system-guide',
          excerpt: '设计系统是确保产品一致性和可维护性的关键工具。',
          content: `## 什么是设计系统？

设计系统是一套**可复用组件**和**明确规范**的集合。

### 核心要素

- **设计原则** — 定义视觉语言与交互模式
- **组件库** — 可复用的 UI 元素
- **色彩体系** — 主色、辅色、中性色方案
- **排版规范** — 字体层级与间距规则

### 构建步骤

1. 分析现有产品模式
2. 抽象核心组件
3. 建立 Design Token
4. 编写使用文档
5. 持续迭代优化

> 好的设计系统是团队协作效率的倍增器。`,
        },
        status: 'published',
      });

      await strapi.documents('api::portfolio.portfolio').create({
        data: {
          title: '电商 App 界面设计',
          slug: 'ecommerce-app',
          description: '为新兴电商平台设计的移动端应用界面，涵盖首页、商品详情、购物车、订单管理等核心页面。',
          category: 'UI 设计',
        },
        status: 'published',
      });

      await strapi.documents('api::portfolio.portfolio').create({
        data: {
          title: '企业官网品牌升级',
          slug: 'brand-upgrade',
          description: '为科技公司进行官网品牌升级，包括视觉形象重塑、网站架构优化和交互体验提升。',
          category: '品牌设计',
        },
        status: 'published',
      });

      await strapi.documents('api::portfolio.portfolio').create({
        data: {
          title: '数据可视化仪表盘',
          slug: 'dashboard',
          description: '企业内部数据分析仪表盘，支持多维度数据展示、实时监控和交互式图表。',
          category: 'Web 应用',
        },
        status: 'published',
      });

      strapi.log.info('✅ Demo data seeded: 2 blogs + 3 portfolios');
    }
  },
};
