'use client';

import React, { use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';
import { LucideIcon, Leaf, Sprout, ShoppingBasket, Sparkles, Filter } from 'lucide-react';

interface CategoryInfo {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  banner: string;
}

const categoryData: Record<string, CategoryInfo> = {
  'organicos': {
    title: 'Produtos Orgânicos',
    subtitle: 'Cultivo 100% livre de agrotóxicos e químicos.',
    icon: Leaf,
    color: '#0e6b17',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK55aZE7MaX3YHsaZQDFFFo5zDwJis9M1jmdB_fI-5iqw8BBFtTQAazRHUPxYfqmHve_JgdDn42XeGtDpsUqq4-hYjWPef-fvUqntmvGfNeaR2JBaaoXrl9xPogX97my02LPE6RbSUeHar9RdzQ_oQYGEM-GA96ahqfDH51XJEsfV33ZQGj5Arw4SnzpfhT_Or_GYsWqtg3dYXDCzMyvLXP1Cc8XJOi58ZdH6zsu4AfHf_j_bUFsQX5pqTetgRJu35hfyziVJds4g'
  },
  'temperos': {
    title: 'Temperos do Mundo',
    subtitle: 'Sabores e aromas para transformar suas receitas.',
    icon: Sprout,
    color: '#a63b00',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY7YNj_VeKRCGPkVBt0dkPJoAODSChZIEuOEEYyVdaQ7fe-YUDqfU4aIJ8dylz74T4YD8DNPt2iSRUfD9tIA3ejl04iyGOGsMsGJqwsFKnTsx8AS2UDHV0opgSRECuPDoA1plXd2FPdRdKm3sfPIOdFWt9FlNVUa75p9Q2vwSn1FG5Vit9nRCe8LU54C45zuia-4L-CKAgh3WuxF52958T0wVKWAIc702OzrtmaAMnrQSPXM_N5s2SmUhVu36JwIZj-YW9MW1MRHQ'
  },
  'kit-pastel': {
    title: 'Kit Pastel de Feira',
    subtitle: 'Tudo o que você precisa para o pastel perfeito em casa.',
    icon: ShoppingBasket,
    color: '#ffc107',
    banner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD7pqvV3vADkCSu2t3aHuFzn4I_bPla8-_wDIWmT0dueCe4Rw9vDvxSofcRXTAyw38KCMj4INg5_19PMCHFfN1LWABNPAKU9KanyQWgI6chApocCEWhJ4tz65y2RlKWnUj9HpEl6DRWzLM9OBNk_W_VAMOIDj1JZ7XSeiyH9dagxU4js7e3ZR9VH9IBvhrl6Zmp2cg_cDsQdyuY5USJRGSEIAVdtxMGMFoLTHasymawxmB7jynsaoEMq3CYxUdBccV9_7LhrK05_8'
  },
  'ofertas-dia': {
    title: 'Ofertas do Dia',
    subtitle: 'Preços de final de feira, frescos e econômicos.',
    icon: Sparkles,
    color: '#bb0014',
    banner: '/images/feira_hero_3.png'
  }
};

const CategoryPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const category = categoryData[slug] || { title: 'Categoria', subtitle: '', icon: Sparkles, color: '#0b612e', banner: '/images/feira_hero_1.png' };
  const Icon = category.icon;

  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    let url = '/api/products?limit=50';
    if (slug === 'ofertas-dia') url += '&promotion=true';
    else if (slug === 'organicos') url += '&organic=true';
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.products) {
          // If it's a specific category like temperos, we might need to filter by category_slug
          // For now, if we don't have a specific API filter for slug, we filter in frontend
          let fetchedProducts = data.data.products;
          if (slug !== 'ofertas-dia' && slug !== 'organicos') {
            fetchedProducts = fetchedProducts.filter((p: any) => p.category?.slug === slug);
          }
          
          setProducts(fetchedProducts.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            unit: p.unit,
            imageUrl: p.image_url || category.banner,
            isOrganic: p.is_organic,
            producerName: p.producer?.stall_name || 'Produtor Local'
          })));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, category.banner]);

  return (
    <div className={styles.page}>
      <Header />
      
      <main className={styles.container}>
        <section className={styles.hero} style={{ backgroundColor: category.color }}>
          <div className={styles.heroContent}>
            <div className={styles.iconCircle}>
              <Icon size={32} color={category.color} />
            </div>
            <h1>{category.title}</h1>
            <p>{category.subtitle}</p>
          </div>
          <div className={styles.heroImage}>
            <img src={category.banner} alt={category.title} />
          </div>
        </section>

        <div className={styles.toolbar}>
          <div className={styles.breadcrumb}>Categorias / {category.title}</div>
          <button className={styles.btnFilter}><Filter size={18} /> Filtrar</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Carregando produtos...</div>
        ) : (
          <div className={styles.grid}>
            {products.length > 0 ? (
              products.map(p => (
                <ProductCard key={p.id} {...p} />
              ))
            ) : (
              <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
                Nenhum produto encontrado nesta categoria.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
