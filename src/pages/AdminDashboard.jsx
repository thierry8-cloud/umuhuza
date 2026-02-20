import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { ADMIN_EMAIL, CATEGORIES } from '@/components/data/locations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, XCircle, Eye, EyeOff, Trash2, Search,
  Package, Users, DollarSign, MessageCircle, Clock,
  TrendingUp, AlertCircle, MoreVertical, Edit, Star
} from 'lucide-react';
import StarRating from '@/components/reviews/StarRating';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(createPageUrl('AdminDashboard'));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser.email === ADMIN_EMAIL || currentUser.role === 'admin');
    };
    checkAuth();
  }, []);

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    enabled: isAdmin,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => base44.entities.Payment.list('-created_date', 500),
    enabled: isAdmin,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
    enabled: isAdmin,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 500),
    enabled: isAdmin,
  });

  const pendingReviews = reviews.filter(r => r.status === 'pending');

  const handleReviewStatus = async (reviewId, status) => {
    await base44.entities.Review.update(reviewId, { status });
    queryClient.invalidateQueries(['admin-reviews']);
    toast.success(status === 'approved' ? 'Review yemejwe' : 'Review yanzwe');
  };

  const pendingProducts = products.filter(p => p.status === 'pending_approval');
  const approvedProducts = products.filter(p => p.status === 'approved');
  const totalRevenue = payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0);

  const handleStatusChange = async (productId, newStatus) => {
    await base44.entities.Product.update(productId, { status: newStatus });
    queryClient.invalidateQueries(['admin-products']);
    toast.success(`Status yavuguruwe neza`);
  };

  const handlePaymentConfirm = async (paymentId, productId) => {
    await base44.entities.Payment.update(paymentId, { status: 'confirmed' });
    await base44.entities.Product.update(productId, { 
      status: 'approved',
      commission_paid: true 
    });
    queryClient.invalidateQueries(['admin-products', 'admin-payments']);
    toast.success('Kwishyura kwemejwe, igicuruzwa cyashoboye');
  };

  const handleDelete = async (id) => {
    await base44.entities.Product.delete(id);
    queryClient.invalidateQueries(['admin-products']);
    setDeleteId(null);
    toast.success('Igicuruzwa cyasibwe');
  };

  const formatPrice = (price) => new Intl.NumberFormat('rw-RW').format(price) + ' RWF';
  const getCategoryInfo = (id) => CATEGORIES.find(c => c.id === id);

  const filteredProducts = products.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {!isAdmin && user ? (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ntabwo wemerewe</h2>
            <p className="text-gray-500">Iyi page ni iya Admin gusa</p>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-300">Genzura no gukurikirana platform</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Ibicuruzwa Byose</p>
                  <p className="text-3xl font-black">{products.length}</p>
                </div>
                <Package className="w-12 h-12 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100">Bitegerejwe</p>
                  <p className="text-3xl font-black">{pendingProducts.length}</p>
                </div>
                <Clock className="w-12 h-12 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Amafaranga</p>
                  <p className="text-3xl font-black">{formatPrice(totalRevenue)}</p>
                </div>
                <DollarSign className="w-12 h-12 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Ubutumwa</p>
                  <p className="text-3xl font-black">{messages.length}</p>
                </div>
                <MessageCircle className="w-12 h-12 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-white shadow">
            <TabsTrigger value="pending" className="relative">
              Bitegerejwe
              {pendingProducts.length > 0 && (
                <Badge className="ml-2 bg-amber-500">{pendingProducts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Ibicuruzwa Byose</TabsTrigger>
            <TabsTrigger value="payments">Kwishyura</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews
              {pendingReviews.length > 0 && (
                <Badge className="ml-2 bg-purple-500">{pendingReviews.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages">Ubutumwa</TabsTrigger>
          </TabsList>

          {/* Pending Products */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Ibicuruzwa Bitegerejwe ({pendingProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-gray-500">Nta bicuruzwa bitegerejwe</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProducts.map(product => {
                      const category = getCategoryInfo(product.category);
                      const payment = payments.find(p => p.product_id === product.id);
                      return (
                        <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=80'}
                            alt={product.title}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold">{product.title}</h3>
                            <p className="text-sm text-gray-500">
                              {category?.name} • {product.seller_name}
                            </p>
                            <p className="text-emerald-600 font-bold">{formatPrice(product.price)}</p>
                            {payment && (
                              <Badge variant="outline" className="mt-1">
                                Commission: {formatPrice(payment.amount)} - {payment.status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Reba
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => {
                                if (payment) {
                                  handlePaymentConfirm(payment.id, product.id);
                                } else {
                                  handleStatusChange(product.id, 'approved');
                                }
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Emeza
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusChange(product.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Anga
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Products */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ibicuruzwa Byose</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Shakisha..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Igicuruzwa</th>
                        <th className="text-left py-3 px-4">Uwagurisha</th>
                        <th className="text-left py-3 px-4">Igiciro</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => {
                        const category = getCategoryInfo(product.category);
                        return (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images?.[0] || 'https://via.placeholder.com/40'}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium">{product.title}</p>
                                  <p className="text-xs text-gray-500">{category?.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm">{product.seller_name}</p>
                              <p className="text-xs text-gray-500">{product.seller_email}</p>
                            </td>
                            <td className="py-3 px-4 font-medium">{formatPrice(product.price)}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                product.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                product.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                                product.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {product.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => setSelectedProduct(product)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Reba
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(product.id, 'approved')}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Emeza
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(product.id, 'hidden')}>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hisha
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => setDeleteId(product.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Siba
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Kwishyura ({payments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Uwishyuye</th>
                        <th className="text-left py-3 px-4">Amafaranga</th>
                        <th className="text-left py-3 px-4">Telefone</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Itariki</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{payment.seller_email}</td>
                          <td className="py-3 px-4 font-medium">{formatPrice(payment.amount)}</td>
                          <td className="py-3 px-4">{payment.payment_phone}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              payment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              payment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(payment.created_date).toLocaleDateString('rw-RW')}
                          </td>
                          <td className="py-3 px-4">
                            {payment.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handlePaymentConfirm(payment.id, payment.product_id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Emeza
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="mb-4">
                    <TabsTrigger value="pending">Bitegerejwe ({pendingReviews.length})</TabsTrigger>
                    <TabsTrigger value="all">Byose</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    {pendingReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <p className="text-gray-500">Nta reviews zitegerejwe</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingReviews.map(review => (
                          <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold">{review.reviewer_name}</p>
                                <p className="text-sm text-gray-500">{review.reviewer_email}</p>
                                <p className="text-sm text-emerald-600 mt-1">{review.product_title}</p>
                              </div>
                              <StarRating rating={review.rating} readonly size="sm" />
                            </div>
                            {review.review_text && (
                              <p className="text-gray-700 mb-4">{review.review_text}</p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleReviewStatus(review.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Emeza
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReviewStatus(review.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Anga
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Reviewer</th>
                            <th className="text-left py-3 px-4">Product</th>
                            <th className="text-left py-3 px-4">Rating</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviews.map(review => (
                            <tr key={review.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <p className="font-medium">{review.reviewer_name}</p>
                                <p className="text-xs text-gray-500">{review.reviewer_email}</p>
                              </td>
                              <td className="py-3 px-4 text-sm">{review.product_title}</td>
                              <td className="py-3 px-4">
                                <StarRating rating={review.rating} readonly size="sm" />
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={
                                  review.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                  review.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {review.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {review.status !== 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReviewStatus(review.id, 'approved')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {review.status !== 'rejected' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReviewStatus(review.id, 'rejected')}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Ubutumwa Bwose ({messages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{msg.sender_name}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{msg.receiver_name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(msg.created_date).toLocaleString('rw-RW')}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-600 mb-1">{msg.product_title}</p>
                      <p className="text-gray-700">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uremeza ko ushaka gusiba?</AlertDialogTitle>
            <AlertDialogDescription>
              Iki gikorwa ntikishobora gusubizwaho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hagarika</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleDelete(deleteId)}
            >
              Siba
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {selectedProduct.images?.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Igiciro</p>
                  <p className="font-bold text-emerald-600">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commission</p>
                  <p className="font-bold">{formatPrice(selectedProduct.commission_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uwagurisha</p>
                  <p className="font-medium">{selectedProduct.seller_name}</p>
                  <p className="text-sm text-gray-500">{selectedProduct.seller_email}</p>
                  <p className="text-sm text-gray-500">{selectedProduct.seller_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Aho biherereye</p>
                  <p className="font-medium">
                    {selectedProduct.sector}, {selectedProduct.district}, {selectedProduct.province}
                  </p>
                </div>
              </div>
              {selectedProduct.description && (
                <div>
                  <p className="text-sm text-gray-500">Ibisobanuro</p>
                  <p>{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}