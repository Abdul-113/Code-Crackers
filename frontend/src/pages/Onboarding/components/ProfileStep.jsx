import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import InputField from '@/pages/Authentication/components/InputField';
import toast from 'react-hot-toast';

export default function ProfileStep({ role, profileData, setProfileData, onNext, onPrev }) {
  
  const handleChange = (key, value) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!profileData.businessName) {
      return toast.error("Organization or Entity Name is required.");
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          {role === 'investor' ? 'Investor Profile' : role === 'buyer' ? 'Buyer Corporate Profile' : 'Business Profile'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tell us about your organization to customize your financing profile.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">
        
        {/* Render for MSME */}
        {(role === 'msme' || !role) && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Business Name"
                id="businessName"
                placeholder="TextilePro Industries"
                value={profileData.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                required
              />
              <InputField
                label="GST Number (Optional)"
                id="gst"
                placeholder="27AAAAA0000A1Z5"
                value={profileData.gst || ''}
                onChange={(e) => handleChange('gst', e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</label>
                <select
                  value={profileData.category || 'Manufacturing'}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {['Manufacturing', 'Retail', 'IT Services', 'Healthcare', 'Logistics', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Annual Revenue</label>
                <select
                  value={profileData.revenue || '₹1 Cr - ₹5 Cr'}
                  onChange={(e) => handleChange('revenue', e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {['< ₹1 Cr', '₹1 Cr - ₹5 Cr', '₹5 Cr - ₹25 Cr', '₹25 Cr+'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Company Size</label>
                <select
                  value={profileData.size || '11-50'}
                  onChange={(e) => handleChange('size', e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {['1-10', '11-50', '51-200', '200+'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Render for Investor */}
        {role === 'investor' && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Entity / Fund Name"
                id="businessName"
                placeholder="AltFin Yield Fund"
                value={profileData.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                required
              />
              <InputField
                label="Target Investment Limit (Optional)"
                id="limit"
                placeholder="₹1,00,00,000"
                value={profileData.limit || ''}
                onChange={(e) => handleChange('limit', e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Investor Class</label>
                <select
                  value={profileData.investorClass || 'Venture Fund'}
                  onChange={(e) => handleChange('investorClass', e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {['Venture Fund', 'Family Office', 'High Net Worth Individual', 'Corporate Yield Pool'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Target Yield APY</label>
                <select
                  value={profileData.targetYield || '8% - 10%'}
                  onChange={(e) => handleChange('targetYield', e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {['6% - 8%', '8% - 10%', '10% - 12%', '12%+'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Render for Buyer */}
        {role === 'buyer' && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Corporate Entity Name"
                id="businessName"
                placeholder="Tata Motors Group"
                value={profileData.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                required
              />
              <InputField
                label="GST Identification"
                id="gst"
                placeholder="27AAAAA0000A1Z5"
                value={profileData.gst || ''}
                onChange={(e) => handleChange('gst', e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Corporate Category</label>
                <select
                  value={profileData.category || 'Automotive'}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {['Automotive', 'Conglomerate', 'Energy', 'Consumer Goods', 'Infrastructure'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Average Repayment Terms</label>
                <select
                  value={profileData.repaymentTerms || '60 Days Net'}
                  onChange={(e) => handleChange('repaymentTerms', e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                >
                  {['30 Days Net', '45 Days Net', '60 Days Net', '90 Days Net'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Global Location Fields (shared by all roles) */}
        <div className="grid sm:grid-cols-3 gap-4">
          <InputField
            label="Country"
            id="country"
            placeholder="India"
            value={profileData.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
          />
          <InputField
            label="State"
            id="state"
            placeholder="Maharashtra"
            value={profileData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
          />
          <InputField
            label="City"
            id="city"
            placeholder="Mumbai"
            value={profileData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <motion.button
            type="button"
            onClick={onPrev}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3.5 px-6 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back</span>
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
