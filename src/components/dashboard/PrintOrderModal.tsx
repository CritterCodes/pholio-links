'use client';

import { useState } from 'react';
import { X, Check, CreditCard, Truck } from 'lucide-react';

interface PrintOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  designImage: string | null; // The data URL of the card design
}

const QUANTITY_OPTIONS = [
  { value: 50, label: '50 Cards', price: 29.99 },
  { value: 100, label: '100 Cards', price: 49.99 },
  { value: 250, label: '250 Cards', price: 89.99 },
  { value: 500, label: '500 Cards', price: 149.99 },
];

const FINISH_OPTIONS = [
  { value: 'matte', label: 'Matte', description: 'Smooth, non-reflective finish' },
  { value: 'gloss', label: 'Gloss', description: 'Shiny, vibrant finish' },
];

export default function PrintOrderModal({ isOpen, onClose, designImage }: PrintOrderModalProps) {
  const [step, setStep] = useState<'options' | 'review'>('options');
  const [quantity, setQuantity] = useState(100);
  const [finish, setFinish] = useState('matte');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const selectedQuantity = QUANTITY_OPTIONS.find(q => q.value === quantity) || QUANTITY_OPTIONS[1];
  const selectedFinish = FINISH_OPTIONS.find(f => f.value === finish) || FINISH_OPTIONS[0];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      let imageUrl = '';
      
      // 1. Upload the design image if provided
      if (designImage) {
        // Convert data URL to Blob
        const res = await fetch(designImage);
        const blob = await res.blob();
        const file = new File([blob], 'business-card-design.png', { type: 'image/png' });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'business-cards');
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          imageUrl = data.url;
        } else {
          console.error('Failed to upload design image');
          // Proceed anyway? Or stop? Let's stop for now as we need the asset.
          throw new Error('Failed to upload design image');
        }
      }

      // 2. Create Checkout Session
      const res = await fetch('/api/print/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          finish,
          imageUrl,
        }),
      });

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">Order Professional Prints</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preview */}
            <div className="space-y-4">
              <div className="aspect-[1.75/1] bg-gray-100 rounded-lg overflow-hidden shadow-lg relative">
                {designImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={designImage} alt="Card Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Preview Available</div>
                )}
              </div>
              <p className="text-xs text-center text-gray-500">
                High-quality printing on premium 350gsm cardstock.
              </p>
            </div>

            {/* Options */}
            <div className="space-y-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUANTITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuantity(opt.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        quantity === opt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-sm text-gray-500">${opt.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish */}
              <div>
                <label className="block text-sm font-medium mb-2">Finish</label>
                <div className="space-y-2">
                  {FINISH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFinish(opt.value)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                        finish === opt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.description}</div>
                      </div>
                      {finish === opt.value && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold">${selectedQuantity.price}</div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div className="flex items-center gap-1 justify-end">
                <Truck className="w-3 h-3" /> Free Shipping
              </div>
              <div className="flex items-center gap-1 justify-end mt-1">
                <CreditCard className="w-3 h-3" /> Secure Checkout
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
