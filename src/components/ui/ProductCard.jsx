import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Eye, Phone, MessageCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function ProductCard({ product, onFavorite, isFavorited, showActions = true }) {
  const [imgError, setImgError] = useState(false);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('rw-RW').format(price) + ' RWF';
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      real_estate: 'Imitungo',
      vehicles: 'Ibinyabiziga',
      construction: 'Imashini',
      tools: 'Ibikoresho',
      party: 'Ibirori',
      tech: 'Ikoranabuhanga'
    };
    return labels[cat] || cat;
  };

  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imgError || !product.images?.[0] ? defaultImage : product.images[0]}
          alt={product.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={product.action_type === 'sell' ? 'bg-emerald-500' : 'bg-blue-500'}>
            {product.action_type === 'sell' ? 'Kugurisha' : 'Gukodesha'}
          </Badge>
          {product.is_featured && (
            <Badge className="bg-amber-500">⭐ Featured</Badge>
          )}
        </div>
        {showActions && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite && onFavorite(product.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              isFavorited 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{product.title}</h3>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">
            {getCategoryLabel(product.category)}
          </Badge>
        </div>
        
        <p className="text-2xl font-black text-emerald-600 mb-3">
          {formatPrice(product.price)}
          {product.action_type === 'rent' && <span className="text-sm font-normal text-gray-500">/ukwezi</span>}
        </p>
        
        {product.province && (
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{product.sector}, {product.district}, {product.province}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>{product.views || 0} views</span>
          </div>
          {product.average_rating > 0 && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="font-medium">{product.average_rating?.toFixed(1)}</span>
              <span className="text-gray-400">({product.review_count || 0})</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Link to={createPageUrl(`ProductDetails?id=${product.id}`)} className="flex-1">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Reba Byinshi
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}