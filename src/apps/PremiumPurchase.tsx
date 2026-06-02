import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { ref, set } from 'firebase/database';
import { db } from '../lib/firebase';
import * as Icons from 'lucide-react';

const BKASH_NUMBER = '01XXXXXXXXX';
const NAGAD_NUMBER = '01XXXXXXXXX';

export function PremiumPurchase() {
  const { user, addNotification, isPremium, login } = useOS();
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [txnId, setTxnId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!txnId.trim() || !user) return;
    setSubmitting(true);
    try {
      await set(ref(db, `premium/requests/${user.uid}`), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        method,
        txnId: txnId.trim(),
        amount: 499,
        status: 'pending',
        timestamp: Date.now()
      });
      addNotification({ title: 'Request Submitted', message: 'Admin will verify and activate premium within 24hrs', icon: 'CheckCircle' });
      setTxnId('');
    } catch (e) {
      addNotification({ title: 'Error', message: 'Submission failed, try again', icon: 'X' });
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Icons.LogIn className="w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign In First</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to purchase Premium</p>
        <button onClick={login} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">Sign in with Google</button>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/30">
          <Icons.Crown className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You're Premium! 🎉</h2>
        <p className="text-gray-400 text-sm mb-6">Enjoy all premium features: voice rooms, social hub, and more!</p>
        <div className="flex gap-3">
          <button onClick={() => useOS().openApp('social')} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold flex items-center gap-2">
            <Icons.MessageCircle className="w-5 h-5" /> Open Social Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-900/40 via-orange-900/30 to-gray-900 p-6 text-center border-b border-yellow-500/20">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
          <Icons.Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">EMU Bot <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Premium</span></h1>
        <p className="text-gray-400 text-sm">Unlock everything — voice rooms, social hub, priority support</p>
      </div>

      {/* Pricing */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 text-center mb-6">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">499</div>
          <div className="text-gray-400 text-sm mt-1">BDT — One Time Payment</div>
          <div className="text-gray-500 text-xs mt-1">Lifetime Premium Access</div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {[
            { icon: 'Headphones', text: 'Agora Voice Rooms — chat while gaming', color: 'text-purple-400' },
            { icon: 'MessageCircle', text: 'Social Hub — friends, chat, hangout', color: 'text-blue-400' },
            { icon: 'Crown', text: 'Premium badge on your profile', color: 'text-yellow-400' },
            { icon: 'Zap', text: 'Priority game access + more daily time', color: 'text-cyan-400' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className={`${f.color}`}>{React.createElement((Icons as any)[f.icon], { className: 'w-5 h-5' })}</div>
              <span className="text-sm text-gray-300">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider mb-3">Send 499 BDT to any:</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { id: 'bkash', label: 'bKash', icon: 'Smartphone', num: BKASH_NUMBER, color: 'from-pink-600 to-red-600' },
            { id: 'nagad', label: 'Nagad', icon: 'Smartphone', num: NAGAD_NUMBER, color: 'from-orange-500 to-red-500' },
            { id: 'rocket', label: 'Rocket', icon: 'Send', num: '01XXXXXXXXX', color: 'from-blue-600 to-cyan-600' },
          ].map(m => (
            <button key={m.id} onClick={() => setMethod(m.id as any)}
              className={`p-4 rounded-xl border text-center transition-all ${method === m.id ? 'bg-gradient-to-br ' + m.color + ' text-white border-transparent shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              <Icons.Smartphone className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs font-bold">{m.label}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="text-xs text-gray-500 mb-2">Send to {method === 'bkash' ? 'bKash' : method === 'nagad' ? 'Nagad' : 'Rocket'}:</div>
          <div className="text-lg font-mono font-bold text-yellow-400 select-all">{method === 'bkash' ? BKASH_NUMBER : method === 'nagad' ? NAGAD_NUMBER : '01XXXXXXXXX'}</div>
          <div className="text-xs text-gray-600 mt-1">Receiver: EMU Bot</div>
        </div>

        {/* Transaction ID */}
        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">After payment, enter TrxID:</h3>
          <div className="flex gap-2">
            <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="bKash/Nagad Transaction ID" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-500" />
            <button onClick={handleSubmit} disabled={!txnId.trim() || submitting} className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl font-bold disabled:opacity-50 transition-all">
              {submitting ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
            </button>
          </div>
          <p className="text-xs text-gray-500">Admin will verify and activate within 24 hours. Contact support for urgent activation.</p>
        </div>
      </div>
    </div>
  );
}
