import React, { useState } from 'react';
import { MapPin, Phone, User, Home, Globe, Navigation, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { Address } from '../types';

interface AddressFormProps {
  initialAddress?: Address;
  onSave: (address: Address) => void;
  isLoading?: boolean;
}

export default function AddressForm({ initialAddress, onSave, isLoading }: AddressFormProps) {
  const [address, setAddress] = useState<Address>(initialAddress || {
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(address);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
            <input
              required
              type="text"
              name="fullName"
              value={address.fullName}
              onChange={handleChange}
              placeholder="Receiver's Name"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
            <input
              required
              type="tel"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Street Address</label>
          <div className="relative group">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
            <input
              required
              type="text"
              name="street"
              value={address.street}
              onChange={handleChange}
              placeholder="Flat, House no., Building, Company, Apartment"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">City</label>
          <div className="relative group">
            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
            <input
              required
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              placeholder="Town/City"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">State</label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
            <input
              required
              type="text"
              name="state"
              value={address.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Zip Code</label>
          <div className="relative group">
            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
            <input
              required
              type="text"
              name="zipCode"
              value={address.zipCode}
              onChange={handleChange}
              placeholder="6-digit Pincode"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Country</label>
          <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
            <select
              name="country"
              value={address.country}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-purple/50 transition-all font-medium appearance-none"
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-purple transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Save size={20} />
            Save Address
          </>
        )}
      </button>
    </form>
  );
}
