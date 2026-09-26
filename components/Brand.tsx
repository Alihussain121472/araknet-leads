import Link from 'next/link';
import { ScanLine } from 'lucide-react';

export function Brand({ onDark = false }: { onDark?: boolean }) {
  return <Link href="/" className={`inline-flex items-center gap-2.5 text-xl font-bold ${onDark ? 'text-term-text' : 'text-text-primary'}`} aria-label="Araknet home"><span className="brand-mark"><ScanLine size={21} aria-hidden="true" /></span>Araknet</Link>;
}
