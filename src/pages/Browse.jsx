import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CATEGORIES } from '@/components/data/locations';
import LocationSelector from '@/components/ui/LocationSelector';
import ProductCard from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, Filter, Grid, List, SlidersHorizontal, X, Save, BookmarkCheck, Trash2, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import RealEstateFilters from '@/components/filters/RealEstateFilters';
import VehicleFilters from '@/components/filters/VehicleFilters';
import CapacityFilters from '@/components/filters/CapacityFilters';
import TechFilters from '@/components/filters/TechFilters';

export default function Browse() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || '';
  const initialAction = urlParams.get('action') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [actionType, setActionType] = useState(initialAction);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [sortBy, setSortBy] = useState('-created_date');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [user, setUser] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
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

  const buildFilter = () => {
    const filter = { status: 'approved' };
    if (selectedCategory) filter.category = selectedCategory;
    if (actionType) filter.action_type = actionType;
    if (province) filter.province = province;
    if (district) filter.district = district;
    if (sector) filter.sector = sector;
    return filter;
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory, actionType, province, district, sector, sortBy],
    queryFn: () => base44.entities.Product.filter(buildFilter(), sortBy, 100),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => user ? base44.entities.Favorite.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const { data: savedFilters = [] } = useQuery({
    queryKey: ['saved-filters', user?.id],
    queryFn: () => user ? base44.entities.SavedFilter.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const favoriteIds = favorites.map(f => f.product_id);

  const handleFavorite = async (productId) => {
    if (!user) {
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
    queryClient.invalidateQueries(['favorites']);
  };

  const applyAdvancedFilters = (product) => {
    // Real Estate filters
    if (selectedCategory === 'real_estate') {
      if (advancedFilters.minBedrooms && product.bedrooms < Number(advancedFilters.minBedrooms)) return false;
      if (advancedFilters.maxBedrooms && product.bedrooms > Number(advancedFilters.maxBedrooms)) return false;
      if (advancedFilters.minBathrooms && product.bathrooms < Number(advancedFilters.minBathrooms)) return false;
      if (advancedFilters.maxBathrooms && product.bathrooms > Number(advancedFilters.maxBathrooms)) return false;
    }

    // Vehicle filters
    if (selectedCategory === 'vehicles') {
      if (advancedFilters.make && product.vehicle_make !== advancedFilters.make) return false;
      if (advancedFilters.model && !product.vehicle_model?.toLowerCase().includes(advancedFilters.model.toLowerCase())) return false;
      if (advancedFilters.minYear && product.vehicle_year < Number(advancedFilters.minYear)) return false;
      if (advancedFilters.maxYear && product.vehicle_year > Number(advancedFilters.maxYear)) return false;
      if (advancedFilters.minMileage && product.vehicle_mileage < Number(advancedFilters.minMileage)) return false;
      if (advancedFilters.maxMileage && product.vehicle_mileage > Number(advancedFilters.maxMileage)) return false;
    }

    // Capacity filters (construction & party)
    if (selectedCategory === 'construction' || selectedCategory === 'party') {
      if (advancedFilters.minCapacity && product.capacity < Number(advancedFilters.minCapacity)) return false;
      if (advancedFilters.maxCapacity && product.capacity > Number(advancedFilters.maxCapacity)) return false;
      if (advancedFilters.capacityUnit && product.capacity_unit !== advancedFilters.capacityUnit) return false;
    }

    // Tech filters
    if (selectedCategory === 'tech') {
      if (advancedFilters.minRam && product.tech_ram < Number(advancedFilters.minRam)) return false;
      if (advancedFilters.maxRam && product.tech_ram > Number(advancedFilters.maxRam)) return false;
      if (advancedFilters.minStorage && product.tech_storage < Number(advancedFilters.minStorage)) return false;
      if (advancedFilters.maxStorage && product.tech_storage > Number(advancedFilters.maxStorage)) return false;
      if (advancedFilters.processor && product.tech_processor !== advancedFilters.processor) return false;
    }

    return true;
  };

  const filteredProducts = products.filter(product => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!product.title?.toLowerCase().includes(term) && 
          !product.description?.toLowerCase().includes(term)) {
        return false;
      }
    }
    if (priceRange.min && product.price < Number(priceRange.min)) return false;
    if (priceRange.max && product.price > Number(priceRange.max)) return false;
    
    if (!applyAdvancedFilters(product)) return false;
    
    return true;
  });

  const getCategoryInfo = (id) => CATEGORIES.find(c => c.id === id);
  const currentCategory = getCategoryInfo(selectedCategory);

  const clearFilters = () => {
    setSelectedCategory('');
    setActionType('');
    setProvince('');
    setDistrict('');
    setSector('');
    setPriceRange({ min: '', max: '' });
    setSearchTerm('');
    setAdvancedFilters({});
  };

  const saveCurrentFilters = async () => {
    if (!user || !saveFilterName.trim()) return;
    
    await base44.entities.SavedFilter.create({
      user_id: user.id,
      user_email: user.email,
      name: saveFilterName,
      category: selectedCategory,
      action_type: actionType,
      filters: {
        province,
        district,
        sector,
        priceRange,
        advancedFilters
      }
    });
    
    queryClient.invalidateQueries(['saved-filters']);
    setShowSaveDialog(false);
    setSaveFilterName('');
    toast.success('Filters zabitswe neza!');
  };

  const loadSavedFilter = (filter) => {
    setSelectedCategory(filter.category || '');
    setActionType(filter.action_type || '');
    setProvince(filter.filters?.province || '');
    setDistrict(filter.filters?.district || '');
    setSector(filter.filters?.sector || '');
    setPriceRange(filter.filters?.priceRange || { min: '', max: '' });
    setAdvancedFilters(filter.filters?.advancedFilters || {});
    toast.success(`Filter "${filter.name}" yashyizweho`);
  };

  const deleteSavedFilter = async (id) => {
    await base44.entities.SavedFilter.delete(id);
    queryClient.invalidateQueries(['saved-filters']);
    toast.success('Filter yasibwe');
  };

  const activeFiltersCount = [
    selectedCategory, actionType, province, district, sector, 
    priceRange.min, priceRange.max,
    ...Object.values(advancedFilters).filter(Boolean)
  ].filter(Boolean).length;

  const renderCategoryFilters = () => {
    switch (selectedCategory) {
      case 'real_estate':
        return <RealEstateFilters filters={advancedFilters} onChange={setAdvancedFilters} />;
      case 'vehicles':
        return <VehicleFilters filters={advancedFilters} onChange={setAdvancedFilters} />;
      case 'construction':
      case 'party':
        return <CapacityFilters filters={advancedFilters} onChange={setAdvancedFilters} category={selectedCategory} />;
      case 'tech':
        return <TechFilters filters={advancedFilters} onChange={setAdvancedFilters} />;
      default:
        return null;
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Saved Filters */}
      {user && savedFilters.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Filters Wabitse</Label>
          <div className="space-y-2">
            {savedFilters.map(filter => (
              <div key={filter.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <button
                  onClick={() => loadSavedFilter(filter)}
                  className="flex-1 text-left text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <BookmarkCheck className="w-4 h-4 inline mr-1" />
                  {filter.name}
                </button>
                <button
                  onClick={() => deleteSavedFilter(filter.id)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</Label>
        <Select value={selectedCategory} onValueChange={(v) => {
          setSelectedCategory(v);
          setAdvancedFilters({});
        }}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Hitamo kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Byose</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Type */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Ubwoko</Label>
        <Select value={actionType} onValueChange={setActionType}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Kugura/Gukodesha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Byose</SelectItem>
            <SelectItem value="sell">Kugurisha</SelectItem>
            <SelectItem value="rent">Gukodesha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      {selectedCategory === 'real_estate' && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700 block">Aho Biherereye</Label>
          <LocationSelector
            province={province}
            district={district}
            sector={sector}
            onProvinceChange={setProvince}
            onDistrictChange={setDistrict}
            onSectorChange={setSector}
          />
        </div>
      )}

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Igiciro (RWF)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="bg-white"
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="bg-white"
          />
        </div>
      </div>

      {/* Category-specific filters */}
      {selectedCategory && (
        <div className="border-t pt-4">
          <Label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters Zinyongereye
          </Label>
          {renderCategoryFilters()}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t">
        {user && (
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Bika Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bika Filters</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Izina rya filter..."
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                />
                <Button 
                  onClick={saveCurrentFilters}
                  disabled={!saveFilterName.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Bika
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Siba Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {currentCategory ? `${currentCategory.icon} ${currentCategory.name}` : 'Ibicuruzwa Byose'}
          </h1>
          <p className="text-emerald-100">
            {filteredProducts.length} ibicuruzwa byabonetse
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Shakisha ibicuruzwa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-0 h-12"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-gray-50 border-0 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_date">Bishya</SelectItem>
                  <SelectItem value="price">Igiciro: Cyoroheje</SelectItem>
                  <SelectItem value="-price">Igiciro: Cyisumbuye</SelectItem>
                  <SelectItem value="-views">Birebwa cyane</SelectItem>
                  <SelectItem value="-average_rating">Rating Nziza</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden h-12 relative">
                    <SlidersHorizontal className="w-5 h-5" />
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-emerald-500 h-5 w-5 p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {getCategoryInfo(selectedCategory)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                </Badge>
              )}
              {actionType && (
                <Badge variant="secondary" className="gap-1">
                  {actionType === 'sell' ? 'Kugurisha' : 'Gukodesha'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setActionType('')} />
                </Badge>
              )}
              {province && (
                <Badge variant="secondary" className="gap-1">
                  {province}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setProvince('')} />
                </Badge>
              )}
              {Object.entries(advancedFilters).map(([key, value]) => value && (
                <Badge key={key} variant="secondary" className="gap-1">
                  {key}: {value}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setAdvancedFilters({...advancedFilters, [key]: ''})} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              <FilterContent />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nta bicuruzwa byabonetse</h3>
                <p className="text-gray-500 mb-6">Gerageza guhindura filters cyangwa shakisha ikindi</p>
                <Button onClick={clearFilters}>Siba Filters Zose</Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      isFavorited={favoriteIds.includes(product.id)}
                      onFavorite={handleFavorite}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}