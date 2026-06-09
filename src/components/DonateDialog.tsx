import React, { useState } from 'react';
import { Project, Donation } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDonationsStore } from '../hooks/useDonationsStore';
import { getActionDeniedMessage, userCanPerformAction } from '../lib/roleAccess';
import { X, CreditCard, ShieldCheck, Heart, Wallet, CheckCircle2 } from 'lucide-react';
import { PillButton } from './PillButton';
import { ModalMotion } from './motion/ModalMotion';

interface DonateDialogProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'amount' | 'payment' | 'receipt';

export function DonateDialog({ project, onClose, onSuccess }: DonateDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createDonation } = useDonationsStore();

  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [receipt, setReceipt] = useState<Donation | null>(null);

  const presets = [10, 25, 50, 100, 250, 1000, 5000];
  const isOwner = user && user.id === project.ownerId;
  const canDonate = user && userCanPerformAction(user.roles, 'donate');

  const currentFee = amount * 0.05;
  const projectReceives = amount - currentFee;

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setError('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setAmount(parsed);
    else setAmount(0);
    setError('');
  };

  const validateAmount = (): boolean => {
    if (!user) {
      setError('Please sign in or register to pledge contributions.');
      return false;
    }
    if (!canDonate) {
      setError(getActionDeniedMessage('donate'));
      return false;
    }
    if (amount <= 0) {
      setError('Please select or enter a positive contribution pledge.');
      return false;
    }
    if (amount > 100000) {
      setError('Pledges are capped at $100,000 per transaction.');
      return false;
    }
    if (project.ownerId === user.id) {
      setError('Project owners cannot donate to their own campaigns.');
      return false;
    }
    return true;
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAmount()) return;
    setStep('payment');
  };

  const handleMockPayment = async () => {
    if (!validateAmount()) return;

    setIsSubmitting(true);
    setError('');
    try {
      const created = await createDonation({
        projectId: project.id,
        projectName: project.title,
        amount,
        isAnonymous,
        message: message.trim() || undefined,
      });
      setReceipt(created);
      setStep('receipt');
      toast.success(`$${amount.toLocaleString()} locked in escrow for "${project.title}".`);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'An unexpected error occurred during checkout.';
      setError(msg.includes('403') || msg.includes('donor')
        ? getActionDeniedMessage('donate')
        : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    onSuccess();
    onClose();
  };

  return (
    <ModalMotion
      open
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      contentClassName="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden relative"
    >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-600 fill-emerald-100" />
            <h3 className="text-lg font-serif font-semibold text-slate-900">
              {step === 'receipt' ? 'Donation receipt' : 'Pledge contribution'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'amount' && (
          <form onSubmit={handleContinueToPayment} className="p-6 space-y-5">
            {!canDonate && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/50 rounded-xl text-xs text-rose-700 font-medium">
                {getActionDeniedMessage('donate')}
              </div>
            )}
            {isOwner && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/50 rounded-xl text-xs text-rose-700 font-medium">
                Project owners cannot fund their own campaigns.
              </div>
            )}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Target Project</label>
              <p className="text-sm font-semibold text-slate-800 font-serif leading-relaxed line-clamp-1">{project.title}</p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500">Pledge Amount ($)</label>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => handlePresetClick(val)}
                    disabled={!!isOwner || !canDonate}
                    className={`py-2 px-1 text-center font-mono text-xs rounded-lg border transition-all ${
                      amount === val && !customAmount
                        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    } disabled:opacity-50`}
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                <input
                  type="number"
                  placeholder="Custom Amount"
                  value={customAmount}
                  onChange={handleCustomChange}
                  disabled={!!isOwner || !canDonate}
                  className="w-full pl-8 pr-12 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">USD</span>
              </div>
            </div>

            {amount > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between font-mono">
                  <span>Pledge Total:</span>
                  <span className="text-slate-900 font-semibold">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>5% Platform Fee:</span>
                  <span>-${currentFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-slate-200/50 pt-1.5 flex justify-between font-mono font-medium text-emerald-700">
                  <span>Project Receives:</span>
                  <span>${projectReceives.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  id="anon-checkbox"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={!!isOwner || !canDonate}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="anon-checkbox" className="text-xs text-slate-600 font-medium select-none">
                  Pledge anonymously
                </label>
              </div>
              <textarea
                rows={2}
                maxLength={160}
                placeholder="Optional pledge message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!!isOwner || !canDonate}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <PillButton type="button" variant="muted" caps={false} onClick={onClose} className="flex-1 py-2.5 px-4 text-xs font-mono">
                Cancel
              </PillButton>
              <PillButton
                type="submit"
                variant="success"
                caps={false}
                loading={isSubmitting}
                disabled={!!isOwner || !canDonate || amount <= 0}
                Icon={CreditCard}
                className="flex-[2] py-2.5 px-4 text-xs font-mono"
              >
                Continue to payment
              </PillButton>
            </div>
          </form>
        )}

        {step === 'payment' && (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}
            <div className="p-4 bg-[#FFEDD5]/40 border border-orange-100 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#B24724]">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-semibold">HopeWorks Sandbox Wallet</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mock payment for demo. Your ${amount.toLocaleString()} pledge will post to the project escrow immediately — no real card charged.
              </p>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p>Card: •••• •••• •••• 4242</p>
              <p>Project: {project.title}</p>
              <p>Total: ${amount.toLocaleString()} USD</p>
            </div>
            <div className="flex gap-3">
              <PillButton
                type="button"
                variant="muted"
                caps={false}
                onClick={() => setStep('amount')}
                className="flex-1 py-2.5 px-4 text-xs font-mono"
              >
                Back
              </PillButton>
              <PillButton
                type="button"
                variant="success"
                caps={false}
                loading={isSubmitting}
                onClick={handleMockPayment}
                Icon={ShieldCheck}
                className="flex-[2] py-2.5 px-4 text-xs font-mono"
              >
                Confirm mock payment
              </PillButton>
            </div>
          </div>
        )}

        {step === 'receipt' && receipt && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Escrow deposit confirmed</p>
              <p className="text-xs text-slate-500">Funds are locked until milestones are independently verified.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ref</span>
                <span className="text-slate-900 font-bold">{receipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Project</span>
                <span className="text-slate-900 font-semibold text-right max-w-[60%] truncate">{receipt.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="text-emerald-700 font-bold">${receipt.amount.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow status</span>
                <span className="text-amber-700 font-semibold">Locked in escrow</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span>{new Date(receipt.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <PillButton
              type="button"
              variant="brand"
              caps={false}
              onClick={handleDone}
              className="w-full py-3 px-4 text-xs font-mono"
            >
              Done — view in Donor Desk
            </PillButton>
          </div>
        )}
    </ModalMotion>
  );
}
