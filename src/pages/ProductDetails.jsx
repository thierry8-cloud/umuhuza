import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CATEGORIES } from '@/components/data/locations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, MapPin, Phone, Mail, MessageCircle, Share2, 
  ChevronLeft, ChevronRight, Eye, Calendar, User, Send, ArrowLeft, Star 
} from 'lucide-react';
import { toast } from 'sonner';
import StarRating from '@/components/reviews/StarRating';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';

export default function ProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (auth) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    };
    getUser();
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      if (products[0]) {
        // Increment views
        await base44.entities.Product.update(productId, { 
          views: (products[0].views || 0) + 1 
        });
      }
      return products[0];
    },
    enabled: !!productId,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => user ? base44.entities.Favorite.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId, status: 'approved' }, '-created_date'),
    enabled: !!productId,
  });

  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const isFavorited = favorites.some(f => f.product_id === productId);
  const userHasReviewed = reviews.some(r => r.reviewer_id === user?.id);
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const handleFavorite = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    const existing = favorites.find(f => f.product_id === productId);
    if (existing) {
      await base44.entities.Favorite.delete(existing.id);
      toast.success('Yakuweho muri favorites');
    } else {
      await base44.entities.Favorite.create({
        user_id: user.id,
        user_email: user.email,
        product_id: productId
      });
      toast.success('Yongeweho muri favorites');
    }
    queryClient.invalidateQueries(['favorites']);
  };

  const sendMessage = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (!messageText.trim()) return;

    const conversationId = [user.id, product.seller_id].sort().join('_') + '_' + productId;
    
    await base44.entities.Message.create({
      sender_id: user.id,
      sender_name: user.full_name,
      sender_email: user.email,
      receiver_id: product.seller_id,
      receiver_name: product.seller_name,
      receiver_email: product.seller_email,
      product_id: productId,
      product_title: product.title,
      content: messageText,
      conversation_id: conversationId
    });

    setMessageText('');
    setShowMessageDialog(false);
    toast.success('Ubutumwa bwoherejwe neza!');
  };

  const submitReview = async (reviewData) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    setSubmittingReview(true);
    try {
      await base44.entities.Review.create({
        product_id: productId,
        product_title: product.title,
        seller_id: product.seller_id,
        seller_email: product.seller_email,
        reviewer_id: user.id,
        reviewer_name: user.full_name,
        reviewer_email: user.email,
        rating: reviewData.rating,
        review_text: reviewData.review_text,
        status: 'pending'
      });
      
      // Update product average rating
      const newReviewCount = (product.review_count || 0) + 1;
      const newAverage = ((product.average_rating || 0) * (product.review_count || 0) + reviewData.rating) / newReviewCount;
      
      await base44.entities.Product.update(productId, {
        average_rating: newAverage,
        review_count: newReviewCount
      });
      
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['product']);
      setShowReviewForm(false);
      toast.success('Review yawe yoherejwe! Izasuzumwa mbere yo kugaragara.');
    } catch (error) {
      toast.error('Habayeho ikosa');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('rw-RW').format(price) + ' RWF';
  };

  const getCategoryInfo = (id) => CATEGORIES.find(c => c.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Igicuruzwa ntikibonetse</h2>
          <Link to={createPageUrl('Browse')}>
            <Button>Subira ku bicuruzwa</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
  ];
  const category = getCategoryInfo(product.category);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Back Button */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link to={createPageUrl('Browse')} className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Subira ku bicuruzwa
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(i => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(i => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      idx === currentImageIndex ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className={product.action_type === 'sell' ? 'bg-emerald-500' : 'bg-blue-500'}>
                  {product.action_type === 'sell' ? 'Kugurisha' : 'Gukodesha'}
                </Badge>
                {category && (
                  <Badge variant="outline">
                    {category.icon} {category.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                {product.title}
              </h1>
              
              <p className="text-4xl font-black text-emerald-600">
                {formatPrice(product.price)}
                {product.action_type === 'rent' && (
                  <span className="text-lg font-normal text-gray-500">/ukwezi</span>
                )}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{product.views || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(product.created_date).toLocaleDateString('rw-RW')}</span>
              </div>
              {averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(averageRating)} readonly size="sm" />
                  <span className="font-medium text-amber-600">{averageRating.toFixed(1)}</span>
                  <span>({reviews.length})</span>
                </div>
              )}
            </div>

            {/* Location */}
            {product.province && (
              <div className="bg-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">
                    {product.sector}, {product.district}, {product.province}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-bold text-lg mb-2">Ibisobanuro</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Uwagurisha
              </h3>
              <div className="space-y-3">
                <p className="font-semibold text-gray-900">{product.seller_name}</p>
                
                <a 
                  href={`tel:${product.seller_phone}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-medium">{product.seller_phone}</span>
                </a>
                
                <a 
                  href={`mailto:${product.seller_email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-medium">{product.seller_email}</span>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-14 text-lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Oherereza Ubutumwa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Oherereza Ubutumwa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <p className="text-sm text-gray-500">
                      Oherereza ubutumwa {product.seller_name} ku bicuruzwa: {product.title}
                    </p>
                    <Textarea
                      placeholder="Andika ubutumwa hano..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={4}
                    />
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={sendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Ohereza
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14"
                onClick={handleFavorite}
              >
                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                className="h-14 w-14"
                onClick={() => {
                  navigator.share?.({
                    title: product.title,
                    url: window.location.href
                  }) || navigator.clipboard.writeText(window.location.href);
                  toast.success('Link yakoporowe!');
                }}
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Reviews ({reviews.length})
                </h3>
                {user && !userHasReviewed && user.id !== product.seller_id && (
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    variant={showReviewForm ? "outline" : "default"}
                    className={!showReviewForm ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {showReviewForm ? 'Hagarika' : 'Tanga Review'}
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <ReviewForm onSubmit={submitReview} loading={submittingReview} />
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nta reviews ziriho kuri iki gicuruzwa</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}