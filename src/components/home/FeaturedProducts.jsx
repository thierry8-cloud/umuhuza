import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ui/ProductCard';

export default function FeaturedProducts({ products, favorites, onFavorite }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const itemsPerPage = 3;

  const next = () => {
    if (currentIndex + itemsPerPage < products.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-amber-500" />
            Ibicuruzwa Byihariye
          </div>
          <h2 className="text-4xl font-black text-gray-900">Featured Products</h2>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: -currentIndex * (100 / itemsPerPage + 1.5) + '%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {products.map((product) => (
                <div key={product.id} className="w-full md:w-1/3 flex-shrink-0 px-2">
                  <ProductCard
                    product={product}
                    isFavorited={favorites?.includes(product.id)}
                    onFavorite={onFavorite}
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {products.length > itemsPerPage && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full z-10"
                onClick={prev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full z-10"
                onClick={next}
                disabled={currentIndex + itemsPerPage >= products.length}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}