'use client';

import React from 'react';
import { Clock, Users, Flame } from 'lucide-react';

interface RecipeCardProps {
  id: string;
  title: string;
  chefName: string;
  imageUrl: string;
  prepTime: string;
  servings: string;
  difficulty: string;
}

export function RecipeCard({ id, title, chefName, imageUrl, prepTime, servings, difficulty }: RecipeCardProps) {
  return (
    <div className="recipe-card">
      <div className="recipe-image-container">
        <img src={imageUrl} alt={title} className="recipe-image" />
        <div className="chef-tag">Por {chefName}</div>
      </div>
      <div className="recipe-info">
        <h3 className="recipe-title">{title}</h3>
        <div className="recipe-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{prepTime}</span>
          </div>
          <div className="meta-item">
            <Users size={14} />
            <span>{servings}</span>
          </div>
          <div className="meta-item">
            <Flame size={14} />
            <span>{difficulty}</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .recipe-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .recipe-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        .recipe-image-container {
          position: relative;
          height: 160px;
        }
        .recipe-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .chef-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--market-orange);
        }
        .recipe-info {
          padding: 16px;
        }
        .recipe-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
          line-height: 1.3;
        }
        .recipe-meta {
          display: flex;
          gap: 12px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default RecipeCard;
