import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ADMIN_EMAIL, CONTACT_INFO } from '@/components/data/locations';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, ShoppingBag, Heart, MessageCircle, User, LogOut, 
  Menu, Plus, Settings, Phone, Mail, MapPin, Instagram, 
  Twitter, ChevronRight, Package, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.role === 'admin';
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const navLinks = [
    { name: 'Ahabanza', href: 'Home', icon: Home },
    { name: 'Ibicuruzwa', href: 'Browse', icon: ShoppingBag },
    { name: 'Twandikire', href: 'Contact', icon: Phone },
  ];

  const userLinks = [
    { name: 'Ibyo Ukunda', href: 'Favorites', icon: Heart },
    { name: 'Ubutumwa', href: 'Messages', icon: MessageCircle },
    { name: 'Ibicuruzwa Byawe', href: 'MyProducts', icon: Package },
    { name: 'Reviews Zawe', href: 'SellerReviews', icon: Star },
  ];

  const hideNavPages = ['AdminDashboard'];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {!hideNavPages.includes(currentPageName) && (
        <header 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-md shadow-lg' 
              : currentPageName === 'Home' 
                ? 'bg-transparent' 
                : 'bg-white shadow-sm'
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className={`text-2xl font-black tracking-tight ${
                  isScrolled || currentPageName !== 'Home' ? 'text-emerald-600' : 'text-white'
                }`}>
                  UMUHUZA
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = currentPageName === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={createPageUrl(link.href)}
                      className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                        isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : isScrolled || currentPageName !== 'Home'
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Right Side */}
              <div className="flex items-center gap-3">
                {/* Publish Button */}
                <Link to={createPageUrl('Publish')}>
                  <Button 
                    className={`hidden sm:flex ${
                      isScrolled || currentPageName !== 'Home'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-white text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Gurisha / Ukodesha
                  </Button>
                </Link>

                {/* User Menu */}
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`rounded-full p-0 h-10 w-10 ${
                          !isScrolled && currentPageName === 'Home' ? 'hover:bg-white/10' : ''
                        }`}
                      >
                        <Avatar className="h-10 w-10 border-2 border-emerald-500">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                            {getInitials(user?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="font-semibold">{user?.full_name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {userLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <DropdownMenuItem key={link.href} asChild>
                            <Link to={createPageUrl(link.href)} className="cursor-pointer">
                              <Icon className="w-4 h-4 mr-2" />
                              {link.name}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AdminDashboard')} className="cursor-pointer text-emerald-600">
                              <Settings className="w-4 h-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 cursor-pointer"
                        onClick={() => base44.auth.logout()}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sohoka
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    onClick={() => base44.auth.redirectToLogin()}
                    variant={isScrolled || currentPageName !== 'Home' ? 'outline' : 'secondary'}
                    className={!isScrolled && currentPageName === 'Home' ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : ''}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Injira
                  </Button>
                )}

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`md:hidden ${
                        !isScrolled && currentPageName === 'Home' ? 'text-white hover:bg-white/10' : ''
                      }`}
                    >
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="py-6 space-y-6">
                      <Link 
                        to={createPageUrl('Publish')} 
                        onClick={() => setMobileMenuOpen(false)}
                        className="block"
                      >
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Gurisha / Ukodesha
                        </Button>
                      </Link>

                      <div className="space-y-1">
                        {navLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.href}
                              to={createPageUrl(link.href)}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <Icon className="w-5 h-5 text-gray-500" />
                              <span className="font-medium">{link.name}</span>
                              <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                            </Link>
                          );
                        })}
                      </div>

                      {isAuthenticated && (
                        <>
                          <div className="h-px bg-gray-200" />
                          <div className="space-y-1">
                            {userLinks.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link
                                  key={link.href}
                                  to={createPageUrl(link.href)}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                  <Icon className="w-5 h-5 text-gray-500" />
                                  <span className="font-medium">{link.name}</span>
                                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={!hideNavPages.includes(currentPageName) ? 'pt-20' : ''}>
        {children}
      </main>

      {/* Footer */}
      {!hideNavPages.includes(currentPageName) && (
        <footer className="bg-slate-900 text-white mt-auto">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Brand */}
              <div>
                <h3 className="text-2xl font-black mb-4">UMUHUZA</h3>
                <p className="text-slate-400 mb-6">
                  Urubuga rwo Kugura no Gukodesha ibicuruzwa byose mu Rwanda
                </p>
                <div className="flex gap-3">
                  <a 
                    href={`https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 p-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href={`https://twitter.com/${CONTACT_INFO.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 p-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a 
                    href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 p-2 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold mb-4">Amabanga Yihuse</h4>
                <ul className="space-y-2">
                  {navLinks.map(link => (
                    <li key={link.href}>
                      <Link 
                        to={createPageUrl(link.href)}
                        className="text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold mb-4">Kategori</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link to={createPageUrl('Browse?category=real_estate')} className="hover:text-emerald-400">🏠 Imitungo</Link></li>
                  <li><Link to={createPageUrl('Browse?category=vehicles')} className="hover:text-emerald-400">🚗 Ibinyabiziga</Link></li>
                  <li><Link to={createPageUrl('Browse?category=construction')} className="hover:text-emerald-400">🏗️ Imashini</Link></li>
                  <li><Link to={createPageUrl('Browse?category=tools')} className="hover:text-emerald-400">⚙️ Ibikoresho</Link></li>
                  <li><Link to={createPageUrl('Browse?category=party')} className="hover:text-emerald-400">🎉 Ibirori</Link></li>
                  <li><Link to={createPageUrl('Browse?category=tech')} className="hover:text-emerald-400">💻 Ikoranabuhanga</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-bold mb-4">Twandikire</h4>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <a href={`tel:${CONTACT_INFO.whatsapp}`} className="hover:text-emerald-400">
                      {CONTACT_INFO.whatsapp}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-emerald-400">
                      {CONTACT_INFO.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 mt-1" />
                    <span>{CONTACT_INFO.location}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
              <p>© {new Date().getFullYear()} UMUHUZA. Uburenganzira bwose burarinzwe.</p>
              <Link to={createPageUrl('License')} className="text-slate-400 hover:text-emerald-400 text-sm mt-2 inline-block">
                License (LGPL v2.1)
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}