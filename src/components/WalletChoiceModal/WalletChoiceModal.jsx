import React from 'react';
import { Award, Wallet } from 'lucide-react';
import './WalletChoiceModal.css';

const WalletChoiceModal = ({ open, onClose, onSelect }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-doja-bg/80"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-doja-dark/80 backdrop-blur p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Billetera</h2>
            <p className="mt-1 text-sm text-white/70">Elige tu método para vincular tu billetera.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => onSelect('metamask')}
            className="w-full rounded-xl border border-white/10 bg-doja-bg/30 hover:bg-doja-bg/40 px-4 py-4 text-left transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-doja-cyan/15 border border-doja-cyan/30 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-doja-cyan" />
              </div>
              <div>
                <div className="font-semibold">MetaMask</div>
                <div className="text-xs text-white/60">Conectar wallet (0x...)</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelect('binance')}
            className="w-full rounded-xl border border-white/10 bg-doja-bg/30 hover:bg-doja-bg/40 px-4 py-4 text-left transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">Binance</div>
                <div className="text-xs text-white/60">ID / correo / UID</div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-4 text-xs text-white/50">
          Nota: una vez vinculada, no podrás cambiarla.
        </div>
      </div>
    </div>
  );
};

export default WalletChoiceModal;
