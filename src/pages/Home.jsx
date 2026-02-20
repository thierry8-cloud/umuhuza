import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CATEGORIES } from '@/components/data/locations';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryCard from '@/components/ui/CategoryCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';

export default function Home() {
  const [selectedAction, setSelectedAction] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    };
    checkAuth();
  }, []);

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ status: 'approved', is_featured: true }, '-created_date', 10),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => user ? base44.entities.Favorite.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const favoriteIds = favorites.map(f => f.product_id);

  const handleFavorite = async (productId) => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    const existing = favorites.find(f => f.product_id === productId);
    if (existing) {
      await base44.entities.Favorite.delete(existing.id);
    } else {
      await base44.entities.Favorite.create({
        user_id: user.id,
        user_email: user.email,
        product_id: productId
      });
    }
  };

  const handleActionSelect = (action) => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(createPageUrl('Home'));
      return;
    }
    setSelectedAction(action);
  };

  const handleCategorySelect = (categoryId) => {
    const actionType = selectedAction === 'buy' ? 'sell' : 'rent';
    window.location.href = createPageUrl(`Browse?action=${actionType}&category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection onActionSelect={handleActionSelect} />

      {/* Category Selection Modal */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-black text-gray-900 mb-2 text-center">
                {selectedAction === 'buy' ? 'Kugura - Hitamo Kategori' : 'Gukodesha - Hitamo Kategori'}
              </h2>
              <p className="text-gray-500 text-center mb-8">
                {selectedAction === 'buy' ? 'Select a category to buy' : 'Select a category to rent'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategorySelect(category.id)}
                  />
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setSelectedAction(null)}>
                  Subira Inyuma
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-gray-900 mb-4">Kategori z'Ibicuruzwa</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Shakisha muri kategori zitandukanye z'ibicuruzwa bigurishwa cyangwa bikodeshwa
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(`Browse?category=${category.id}`)}>
                  <CategoryCard category={category} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <FeaturedProducts
          products={featuredProducts}
          favorites={favoriteIds}
          onFavorite={handleFavorite}
        />
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80')] bg-cover bg-center opacity-10" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ufite Icyo Ugurisha cyangwa Ukodesha?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Tangirira hano kugurisha cyangwa gukodesha ibicuruzwa byawe ku rubuga rwacu
            </p>
            <Link to={createPageUrl('Publish')}>
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-7 text-lg rounded-2xl shadow-2xl">
                <Plus className="w-6 h-6 mr-2" />
                Gurisha cyangwa Ukodesha
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}