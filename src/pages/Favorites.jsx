import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(createPageUrl('Favorites'));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const { data: favorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => user ? base44.entities.Favorite.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['favorite-products', favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];
      const productIds = favorites.map(f => f.product_id);
      const allProducts = await base44.entities.Product.filter({ status: 'approved' });
      return allProducts.filter(p => productIds.includes(p.id));
    },
    enabled: favorites.length > 0,
  });

  const handleRemoveFavorite = async (productId) => {
    const favorite = favorites.find(f => f.product_id === productId);
    if (favorite) {
      await base44.entities.Favorite.delete(favorite.id);
      queryClient.invalidateQueries(['favorites']);
    }
  };

  const isLoading = loadingFavorites || loadingProducts;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-100 p-3 rounded-xl">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Ibyo Ukunda</h1>
            <p className="text-gray-500">{products.length} ibicuruzwa</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Nta bicuruzwa ukunda</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Kanda ku mutima ku bicuruzwa ukunda kugira ngo ubibike hano
            </p>
            <Link to={createPageUrl('Browse')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shakisha Ibicuruzwa
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  isFavorited={true}
                  onFavorite={handleRemoveFavorite}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}