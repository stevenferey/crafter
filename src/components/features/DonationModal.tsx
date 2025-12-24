import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BTC_ADDRESS = import.meta.env.VITE_DONATION_BTC;
const ETH_ADDRESS = import.meta.env.VITE_DONATION_ETH;

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 text-sm font-medium rounded-md bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-border))] transition-colors"
    >
      {copied ? 'Copié !' : 'Copier'}
    </button>
  );
}

function AddressRow({
  icon,
  label,
  address,
}: {
  icon: React.ReactNode;
  label: string;
  address: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[rgb(var(--color-text))]">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))]">
        <code className="flex-1 text-sm text-[rgb(var(--color-text-secondary))] font-mono">
          {truncateAddress(address)}
        </code>
        <CopyButton text={address} />
      </div>
    </div>
  );
}

// Bitcoin icon
function BitcoinIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#F7931A]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.526 2.107c-.345-.087-.7-.168-1.053-.25l.53-2.12-1.317-.33-.54 2.153c-.286-.065-.568-.13-.843-.197l.001-.007-1.815-.453-.35 1.407s.974.223.955.238c.534.133.63.485.614.764l-.614 2.465c.037.01.085.024.136.045l-.138-.035-.86 3.45c-.065.16-.23.4-.605.307.013.02-.955-.238-.955-.238l-.652 1.514 1.714.427c.318.08.63.163.94.24l-.545 2.19 1.313.328.54-2.157c.36.1.707.19 1.046.273l-.537 2.152 1.316.327.546-2.183c2.245.427 3.93.254 4.64-1.778.57-1.635-.027-2.578-1.21-3.193.86-.198 1.508-.766 1.68-1.938zm-3.01 4.22c-.404 1.64-3.157.752-4.05.53l.72-2.9c.896.224 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.733-3.405.548l.654-2.63c.744.186 3.137.534 2.75 2.082z" />
    </svg>
  );
}

// Ethereum icon
function EthereumIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#627EEA]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
    </svg>
  );
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const hasAnyAddress = BTC_ADDRESS || ETH_ADDRESS;

  if (!hasAnyAddress) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Soutenir le projet">
      <div className="space-y-4">
        {BTC_ADDRESS && (
          <AddressRow
            icon={<BitcoinIcon />}
            label="Bitcoin"
            address={BTC_ADDRESS}
          />
        )}

        {ETH_ADDRESS && (
          <AddressRow
            icon={<EthereumIcon />}
            label="Ethereum (ERC20)"
            address={ETH_ADDRESS}
          />
        )}

        <p className="text-center text-sm text-[rgb(var(--color-text-muted))] pt-2">
          Merci pour votre soutien !
        </p>
      </div>
    </Modal>
  );
}

// Export icons for use in footer
export { BitcoinIcon, EthereumIcon };
