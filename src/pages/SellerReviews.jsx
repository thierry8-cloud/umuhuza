import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import StarRating from '@/components/reviews/StarRating';
import ReviewCard from '@/components/reviews/ReviewCard';
import { Link } from 'react-router-dom';

export default function SellerReviews() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(createPageUrl('SellerReviews'));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['seller-reviews', user?.id],
    queryFn: () => user ? base44.entities.Review.filter({ seller_id: user.id }, '-created_date') : [],
    enabled: !!user,
  });

  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const rejectedReviews = reviews.filter(r => r.status === 'rejected');

  const averageRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: approvedReviews.filter(r => r.rating === rating).length,
    percentage: approvedReviews.length > 0 
      ? (approvedReviews.filter(r => r.rating === rating).length / approvedReviews.length) * 100 
      : 0
  }));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-amber-100 p-3 rounded-xl">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Reviews Zawe</h1>
            <p className="text-gray-500">Reba ibitekerezo by'abaguzi ku bicuruzwa byawe</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Average Rating</p>
                  <p className="text-3xl font-black">{averageRating.toFixed(1)}</p>
                  <StarRating rating={Math.round(averageRating)} readonly size="sm" />
                </div>
                <Star className="w-10 h-10 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Byemejwe</p>
                  <p className="text-3xl font-black">{approvedReviews.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Bitegerejwe</p>
                  <p className="text-3xl font-black">{pendingReviews.length}</p>
                </div>
                <Clock className="w-10 h-10 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Reviews Zose</p>
                  <p className="text-3xl font-black">{reviews.length}</p>
                </div>
                <MessageSquare className="w-10 h-10 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-4">{rating}</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-amber-400 h-full rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="approved">
              <TabsList className="mb-4">
                <TabsTrigger value="approved">
                  Byemejwe ({approvedReviews.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Bitegerejwe ({pendingReviews.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Byanzwe ({rejectedReviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="approved">
                {approvedReviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nta reviews zemejwe</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedReviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ReviewCard review={review} />
                        <Link 
                          to={createPageUrl(`ProductDetails?id=${review.product_id}`)}
                          className="text-sm text-emerald-600 hover:underline mt-2 block"
                        >
                          {review.product_title} →
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending">
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nta reviews zitegerejwe</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="relative">
                          <Badge className="absolute -top-2 -right-2 bg-blue-500">Pending</Badge>
                          <ReviewCard review={review} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rejected">
                {rejectedReviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <XCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nta reviews zanzwe</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedReviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="relative opacity-60">
                          <Badge className="absolute -top-2 -right-2 bg-red-500">Rejected</Badge>
                          <ReviewCard review={review} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}