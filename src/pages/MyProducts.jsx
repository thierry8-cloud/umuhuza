import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CATEGORIES } from '@/components/data/locations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, 
  EyeOff, MoreVertical, AlertCircle 
} from 'lucide-react';
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
import { toast } from 'sonner';

export default function MyProducts() {
  const [user, setUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(createPageUrl('MyProducts'));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['my-products', user?.id],
    queryFn: () => user ? base44.entities.Product.filter({ seller_id: user.id }, '-created_date') : [],
    enabled: !!user,
  });

  const handleDelete = async (id) => {
    await base44.entities.Product.delete(id);
    queryClient.invalidateQueries(['my-products']);
    setDeleteId(null);
    toast.success('Igicuruzwa cyasibwe neza');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('rw-RW').format(price) + ' RWF';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Tegereza kwishyura' },
      pending_approval: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Tegereza kwemezwa' },
      approved: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Byemejwe' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Byanzwe' },
      hidden: { color: 'bg-gray-100 text-gray-800', icon: EyeOff, label: 'Bihishe' },
    };
    const config = statusConfig[status] || statusConfig.pending_payment;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getCategoryInfo = (id) => CATEGORIES.find(c => c.id === id);

  const filterByStatus = (status) => {
    if (status === 'all') return products;
    return products.filter(p => p.status === status);
  };

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Ibicuruzwa Byawe</h1>
            <p className="text-gray-500">Genzura no gukurikirana ibicuruzwa byawe</p>
          </div>
          <Link to={createPageUrl('Publish')}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-5 h-5 mr-2" />
              Ongeraho Igicuruzwa
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-white shadow-sm">
            <TabsTrigger value="all">Byose ({products.length})</TabsTrigger>
            <TabsTrigger value="approved">Byemejwe ({filterByStatus('approved').length})</TabsTrigger>
            <TabsTrigger value="pending_approval">Bitegerejwe ({filterByStatus('pending_approval').length})</TabsTrigger>
            <TabsTrigger value="rejected">Byanzwe ({filterByStatus('rejected').length})</TabsTrigger>
          </TabsList>

          {['all', 'approved', 'pending_approval', 'rejected'].map(status => (
            <TabsContent key={status} value={status}>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filterByStatus(status).length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nta bicuruzwa</h3>
                  <p className="text-gray-500 mb-6">Nta bicuruzwa ufite muri iki cyiciro</p>
                  <Link to={createPageUrl('Publish')}>
                    <Button>
                      <Plus className="w-5 h-5 mr-2" />
                      Ongeraho Igicuruzwa
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterByStatus(status).map((product, index) => {
                    const category = getCategoryInfo(product.category);
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative h-48">
                            <img
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80'}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3">
                              {getStatusBadge(product.status)}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-3 right-3 bg-white/90"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                  <Link to={createPageUrl(`ProductDetails?id=${product.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Reba
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={createPageUrl(`EditProduct?id=${product.id}`)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Hindura
                                  </Link>
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
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              {category && (
                                <Badge variant="outline" className="text-xs">
                                  {category.icon} {category.name}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">
                              {product.title}
                            </h3>
                            <p className="text-xl font-black text-emerald-600">
                              {formatPrice(product.price)}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {product.views || 0}
                              </div>
                              <span>
                                {new Date(product.created_date).toLocaleDateString('rw-RW')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uremeza ko ushaka gusiba?</AlertDialogTitle>
            <AlertDialogDescription>
              Iki gikorwa ntikishobora gusubizwaho. Igicuruzwa kizasibwa burundu.
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
    </div>
  );
}