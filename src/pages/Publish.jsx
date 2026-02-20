import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { CATEGORIES, MTN_PAYMENT_NUMBER, COMMISSION_RATE } from '@/components/data/locations';
import LocationSelector from '@/components/ui/LocationSelector';
import CategoryCard from '@/components/ui/CategoryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, X, Image as ImageIcon, ChevronRight, ChevronLeft, 
  Calculator, Phone, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Publish() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState(null);

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

  const [paymentData, setPaymentData] = useState({
    confirmed: false,
    paymentPhone: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) {
        base44.auth.redirectToLogin(createPageUrl('Publish'));
        return;
      }
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        seller_phone: currentUser.phone || ''
      }));
    };
    checkAuth();
  }, []);

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

  const commission = formData.price ? Math.ceil(Number(formData.price) * COMMISSION_RATE) : 0;

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.category;
      case 2:
        if (!formData.title || !formData.price || !formData.seller_phone) return false;
        if (formData.category === 'real_estate' && (!formData.province || !formData.district || !formData.sector)) return false;
        if (formData.images.length < 1) return false;
        return true;
      case 3:
        return paymentData.confirmed && paymentData.paymentPhone;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Create product
      const product = await base44.entities.Product.create({
        ...formData,
        price: Number(formData.price),
        seller_id: user.id,
        seller_name: user.full_name,
        seller_email: user.email,
        commission_amount: commission,
        status: 'pending_approval',
        commission_paid: true
      });

      // Create payment record
      await base44.entities.Payment.create({
        product_id: product.id,
        seller_id: user.id,
        seller_email: user.email,
        amount: commission,
        product_price: Number(formData.price),
        payment_phone: paymentData.paymentPhone,
        status: 'pending'
      });

      setProductId(product.id);
      setStep(4);
      toast.success('Igicuruzwa cyawe cyoherejwe neza!');
    } catch (error) {
      toast.error('Habayeho ikosa. Ongera ugerageze.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('rw-RW').format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                  step >= s 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-20 h-1 rounded-full ${
                    step > s ? 'bg-emerald-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center gap-12 mt-4 text-sm">
            <span className={step >= 1 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Kategori</span>
            <span className={step >= 2 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Amakuru</span>
            <span className={step >= 3 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Kwishyura</span>
            <span className={step >= 4 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>Byarangiye</span>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Hitamo Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label className="text-lg mb-4 block">Ugura cyangwa Ukodesha?</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={formData.action_type === 'sell' ? 'default' : 'outline'}
                      className={`flex-1 h-16 text-lg ${formData.action_type === 'sell' ? 'bg-emerald-600' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, action_type: 'sell' }))}
                    >
                      Kugurisha (Sell)
                    </Button>
                    <Button
                      type="button"
                      variant={formData.action_type === 'rent' ? 'default' : 'outline'}
                      className={`flex-1 h-16 text-lg ${formData.action_type === 'rent' ? 'bg-blue-600' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, action_type: 'rent' }))}
                    >
                      Gukodesha (Rent)
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      selected={formData.category === category.id}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Product Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Amakuru y'Igicuruzwa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Izina ry'igicuruzwa <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Urugero: Inzu nziza i Kigali"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Igiciro (RWF) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className="h-12 text-lg font-bold"
                  />
                  {formData.action_type === 'rent' && (
                    <p className="text-sm text-gray-500">Igiciro cy'ukwezi</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Nimero ya telefone <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.seller_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, seller_phone: e.target.value }))}
                    placeholder="+250..."
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ibisobanuro</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Sobanura neza igicuruzwa cyawe..."
                    rows={4}
                  />
                </div>

                {/* Location for Real Estate */}
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
                      required
                    />
                  </div>
                )}

                {/* Image Upload */}
                <div className="space-y-4">
                  <Label>Amafoto (Nibura 1, byinshi 10) <span className="text-red-500">*</span></Label>
                  
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
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Kwishyura Commission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calculator className="w-6 h-6 text-emerald-600" />
                    <span className="font-semibold">Uburyo bwo kubara</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Igiciro cy'igicuruzwa:</span>
                      <span className="font-bold">{formatPrice(formData.price)} RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission (5%):</span>
                      <span className="font-bold text-emerald-600">{formatPrice(commission)} RWF</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Wishyura:</span>
                      <span className="font-black text-emerald-600">{formatPrice(commission)} RWF</span>
                    </div>
                  </div>
                </div>

                <Alert className="border-amber-200 bg-amber-50">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>MTN Mobile Money:</strong> Ohereza {formatPrice(commission)} RWF kuri {MTN_PAYMENT_NUMBER}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Nimero wakoresheje wishyura</Label>
                  <Input
                    value={paymentData.paymentPhone}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentPhone: e.target.value }))}
                    placeholder="+250..."
                    className="h-12"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentData.confirmed}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, confirmed: e.target.checked }))}
                    className="w-5 h-5 mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">
                    Ndahamya ko noherejwe {formatPrice(commission)} RWF kuri {MTN_PAYMENT_NUMBER} nkoresheje MTN Mobile Money
                  </span>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="shadow-xl border-0 text-center">
              <CardContent className="py-12">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Murakoze!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Igicuruzwa cyawe cyoherejwe neza. Admin azagusuzuma mu minota 10 nyuma yo kwemeza ko wishyuye.
                </p>
                <Alert className="border-emerald-200 bg-emerald-50 text-left mb-6">
                  <AlertCircle className="w-4 h-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    Tegereza iminota 10 kugira ngo igicuruzwa cyawe kigaragare ku rubuga.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl('MyProducts')}
                  >
                    Reba Ibicuruzwa Byawe
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => window.location.href = createPageUrl('Home')}
                  >
                    Subira Ahabanza
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="h-12 px-8"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Inyuma
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!validateStep()}
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700"
              >
                Komeza
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep() || loading}
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Ohereza Igicuruzwa
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}