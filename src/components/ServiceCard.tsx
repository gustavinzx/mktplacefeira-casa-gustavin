'use client';

import React from 'react';
import { Star, Clock, Users, ChevronRight, Verified } from 'lucide-react';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  id: string;
  title: string;
  provider: string;
  price: number;
  rating: number;
  duration: string;
  capacity?: string;
  imageUrl: string;
  category: string;
  isHighDemand?: boolean;
}

const ServiceCard = ({
  title,
  provider,
  price,
  rating,
  duration,
  capacity,
  imageUrl,
  category,
  isHighDemand
}: ServiceCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.image} />
        {isHighDemand && (
          <span className={styles.demandBadge}>
            <Verified size={12} fill="currentColor" /> Alta Procura
          </span>
        )}
        <span className={styles.categoryBadge}>{category}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.provider}>{provider}</p>
          <div className={styles.rating}>
            <Star size={14} fill="#ffc107" color="#ffc107" />
            <span>{rating}</span>
          </div>
        </div>

        <h3 className={styles.title}>{title}</h3>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <Clock size={16} />
            <span>{duration}</span>
          </div>
          {capacity && (
            <div className={styles.detailItem}>
              <Users size={16} />
              <span>{capacity}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.priceArea}>
            <span className={styles.label}>A partir de</span>
            <div className={styles.price}>
              <span>R$</span> {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button className={styles.btnBook}>
            Reservar <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
