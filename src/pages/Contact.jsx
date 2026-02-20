import React from 'react';
import { motion } from 'framer-motion';
import { CONTACT_INFO } from '@/components/data/locations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Phone, Mail, MapPin, MessageCircle, Instagram, Twitter, 
  Send, ExternalLink 
} from 'lucide-react';

export default function Contact() {
  const contactLinks = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: CONTACT_INFO.whatsapp,
      href: `https://wa.me/${CONTACT_INFO.whatsapp.replace(/\+/g, '')}`,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Mail,
      label: 'Email',
      value: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: CONTACT_INFO.instagram,
      href: `https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`,
      color: 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      value: CONTACT_INFO.twitter,
      href: `https://twitter.com/${CONTACT_INFO.twitter.replace('@', '')}`,
      color: 'bg-blue-400 hover:bg-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Twandikire
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dufashe kubona ibyo ukeneye. Tuzagusubiza mu masaha make.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Amakuru ya Contact</h2>
                <p className="text-emerald-100">Duhamagare cyangwa utubazire</p>
              </div>
              <CardContent className="p-8 space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Aho tubarizwa</h3>
                    <p className="text-gray-600">{CONTACT_INFO.location}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefone</h3>
                    <a href={`tel:${CONTACT_INFO.whatsapp}`} className="text-emerald-600 hover:underline">
                      {CONTACT_INFO.whatsapp}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="text-emerald-600 hover:underline">
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4">Dukurikire</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {contactLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${link.color} text-white rounded-xl p-4 flex items-center gap-3 transition-all`}
                        >
                          <Icon className="w-5 h-5" />
                          <div>
                            <span className="font-medium block text-sm">{link.label}</span>
                            <span className="text-xs opacity-80">{link.value}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 ml-auto opacity-60" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Twandikire Ubutumwa</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Izina ryawe</Label>
                      <Input placeholder="John Doe" className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="john@example.com" className="h-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input placeholder="+250..." className="h-12" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ubutumwa bwawe</Label>
                    <Textarea
                      placeholder="Andika ubutumwa bwawe hano..."
                      rows={5}
                    />
                  </div>

                  <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-lg">
                    <Send className="w-5 h-5 mr-2" />
                    Ohereza Ubutumwa
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Map Embed (optional placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="bg-gray-200 h-80 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3" />
                <p>Kigali, Rwanda</p>
                <p className="text-sm">{CONTACT_INFO.location}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}