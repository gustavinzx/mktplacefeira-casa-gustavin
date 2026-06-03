'use client';

import React, { useEffect, useState } from 'react';
import styles from './CategoryGrid.module.css';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

import { Loader2 } from 'lucide-react';

type Category = { id: string; name: string; slug: string; icon: string | null; };

const PALETTE = [
  { bg: 'rgba(252,108,41,0.1)', color: '#fc6c29' },
  { bg: 'rgba(251,188,4,0.1)', color: '#fbbc04' },
  { bg: 'rgba(14,107,23,0.1)', color: '#0e6b17' },
  { bg: 'rgba(74,161,93,0.1)', color: '#4aa15d' },
  { bg: 'rgba(121,85,72,0.1)', color: '#795548' },
  { bg: 'rgba(186,26,26,0.1)', color: '#ba1a1a' },
  { bg: 'rgba(18,93,48,0.1)', color: '#125d30' },
  { bg: 'rgba(33,33,33,0.1)', color: '#212121' },
];

const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('mktplace_feira_categories')
      .select('id, name, slug, icon')
      .is('parent_id', null)
      .order('name')
      .then(({ data }) => { 
        if (data) setCategories(data); 
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Loader2 size={32} className="animate-spin" color="#0e6b17" />
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div className={styles.container}>
      {categories.map((cat, i) => {
        const { bg, color } = PALETTE[i % PALETTE.length];
        return (
          <Link href={`/search?category=${cat.slug}`} key={cat.id} className={styles.item}>
            <div className={styles.iconWrapper} style={{ backgroundColor: bg }}>
              {cat.icon ? (
                <span style={{ fontSize: 32, lineHeight: 1 }}>{cat.icon}</span>
              ) : (
                <span style={{ fontSize: 28, lineHeight: 1, color }}>📦</span>
              )}
            </div>
            <span className={styles.name}>{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
