'use client';

import React from 'react';
import styles from './CategoryGrid.module.css';
import { Apple, Salad, Carrot, Cookie, Sprout, Milk } from 'lucide-react';

const categories = [
  { id: '1', name: 'Frutas', icon: Apple, color: 'rgba(14, 107, 23, 0.1)', iconColor: '#0e6b17' },
  { id: '2', name: 'Legumes', icon: Carrot, color: 'rgba(166, 59, 0, 0.1)', iconColor: '#a63b00' },
  { id: '3', name: 'Verduras', icon: Salad, color: 'rgba(48, 133, 47, 0.1)', iconColor: '#30852f' },
  { id: '4', name: 'Pastel', icon: Cookie, color: 'rgba(255, 193, 7, 0.1)', iconColor: '#ffc107' },
  { id: '5', name: 'Temperos', icon: Sprout, color: 'rgba(186, 26, 26, 0.1)', iconColor: '#ba1a1a' },
  { id: '6', name: 'Laticínios', icon: Milk, color: 'rgba(251, 188, 4, 0.1)', iconColor: '#fbbc04' },
];

const CategoryGrid = () => {
  return (
    <div className={styles.container}>
      {categories.map((cat) => (
        <div key={cat.id} className={styles.item}>
          <div 
            className={styles.iconWrapper} 
            style={{ backgroundColor: cat.color }}
          >
            <cat.icon size={32} style={{ color: cat.iconColor }} />
          </div>
          <span className={styles.name}>{cat.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
