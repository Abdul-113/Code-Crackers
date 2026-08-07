import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import InputField from '@/pages/Authentication/components/InputField';

export default function ExtractedDataCard({ initialData, onNext }) {
  const [data, setData] = useState({
    invoiceNumber: initialData?.invoiceNumber || 'INV-2026-089',
    invoiceDate: initialData?.invoiceDate || '2026-07-09',
    supplier: initialData?.supplier || 'TextilePro Industries Ltd',
    buyer: initialData?.buyer || 'Tata Motors Group',
    gstNumber: initialData?.gstNumber || '27AAAAA0000A1Z5',
    amount: initialData?.amount || '945000',
    dueDate: initialData?.dueDate || '2026-09-09',
    terms: initialData?.paymentTerms || '60 Days Net',
    purchaseOrder: initialData?.purchaseOrder || 'PO-94821-TAT',
    category: initialData?.category || 'Logistics / Supply Chain'
  });

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onNext(data);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-100 dark:border-violet-950 bg-violet-50/50 dark:bg-violet-950/20 text-xs font-semibold text-violet-600 dark:text-violet-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{(initialData?.confidence || 98.6).toFixed(1)}% OCR Confidence Score</span>
          </div>
        </div>
        <h3 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
          Extracted Bill Details
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Verify and modify the AI parsed details before locking them to blockchain contracts.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">
        
        {/* Form Inputs Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <InputField
            label="Invoice Number"
            id="invoiceNumber"
            value={data.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
            required
          />
          <InputField
            label="Invoice Date"
            id="invoiceDate"
            type="date"
            value={data.invoiceDate}
            onChange={(e) => handleChange('invoiceDate', e.target.value)}
            required
          />
          <InputField
            label="Supplier (MSME Owner)"
            id="supplier"
            value={data.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            required
          />
          <InputField
            label="Buyer (Corporate Partner)"
            id="buyer"
            value={data.buyer}
            onChange={(e) => handleChange('buyer', e.target.value)}
            required
          />
          <InputField
            label="GST Registration Number"
            id="gstNumber"
            value={data.gstNumber}
            onChange={(e) => handleChange('gstNumber', e.target.value)}
            required
          />
          <InputField
            label="Invoice Amount (INR)"
            id="amount"
            type="number"
            value={data.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            required
          />
          <InputField
            label="Maturity Due Date"
            id="dueDate"
            type="date"
            value={data.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            required
          />
          <InputField
            label="Payment Terms"
            id="terms"
            value={data.terms}
            onChange={(e) => handleChange('terms', e.target.value)}
            required
          />
          <InputField
            label="Purchase Order ID"
            id="purchaseOrder"
            value={data.purchaseOrder}
            onChange={(e) => handleChange('purchaseOrder', e.target.value)}
            required
          />
          <InputField
            label="Bill Category"
            id="category"
            value={data.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
          >
            <span>Lock &amp; Verify Invoice</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </motion.button>
        </div>

      </form>
    </div>
  );
}
