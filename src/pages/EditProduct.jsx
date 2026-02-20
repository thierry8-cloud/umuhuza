import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { CATEGORIES } from '@/components/data/locations';
import LocationSelector from '@/components/ui/LocationSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function EditProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    action_type: 'sell',
    price: '',
    description: '',
    images: [],
    province: '',
    district: '',
    sector: '',
    seller_phone: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(createPageUrl('EditProduct') + `?id=${productId}`);
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    checkAuth();
  }, [productId]);

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId && !!user,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        category: product.category || '',
        action_type: product.action_type || 'sell',
        price: product.price?.toString() || '',
        description: product.description || '',
        images: product.images || [],
        province: product.province || '',
        district: product.district || '',
        sector: product.sector || '',
        seller_phone: product.seller_phone || ''
      });
    }
  }, [product]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      toast.error('Amafoto ntashobora kurenga 10');
      return;
    }

    setLoading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (error) {
        toast.error('Habayeho ikosa mu kohereza ifoto');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
    setLoading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price) {
      toast.error('Uzuza izina n\'igiciro');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.Product.update(productId, {
        ...formData,
        price: Number(formData.price)
      });
      toast.success('Igicuruzwa cyavuguruwe neza!');
      window.location.href = createPageUrl('MyProducts');
    } catch (error) {
      toast.error('Habayeho ikosa');
    } finally {
      setLoading(false);
    }
  };

  if (!user || loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (product && product.seller_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ntabwo wemerewe</h2>
          <p className="text-gray-500 mb-4">Ntushobora guhindura iki gicuruzwa</p>
          <Link to={createPageUrl('MyProducts')}>
            <Button>Subira ku bicuruzwa byawe</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to={createPageUrl('MyProducts')} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Subira ku bicuruzwa byawe
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Hindura Igicuruzwa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Izina ry'igicuruzwa</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ubwoko</Label>
                <Select value={formData.action_type} onValueChange={(v) => setFormData(prev => ({ ...prev, action_type: v }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sell">Kugurisha</SelectItem>
                    <SelectItem value="rent">Gukodesha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Igiciro (RWF)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.seller_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, seller_phone: e.target.value }))}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Ibisobanuro</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            {formData.category === 'real_estate' && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Aho Biherereye</Label>
                <LocationSelector
                  province={formData.province}
                  district={formData.district}
                  sector={formData.sector}
                  onProvinceChange={(v) => setFormData(prev => ({ ...prev, province: v }))}
                  onDistrictChange={(v) => setFormData(prev => ({ ...prev, district: v }))}
                  onSectorChange={(v) => setFormData(prev => ({ ...prev, sector: v }))}
                />
              </div>
            )}

            {/* Images */}
            <div className="space-y-4">
              <Label>Amafoto</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {formData.images.length < 10 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Ongeraho</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link to={createPageUrl('MyProducts')} className="flex-1">
                <Button variant="outline" className="w-full h-12">
                  Hagarika
                </Button>
              </Link>
              <Button 
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Bika Impinduka
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}