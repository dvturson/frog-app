/**
 * STUDENT / QR: scan the FROG's rotating check-in QR (camera or photo upload).
 * Calls check_in(event_id, code), which records "arrived". The FROG confirms
 * at the end of the event, which is when points are awarded.
 * TODO:
 * - [ ] Haptic / sound feedback on success
 * - [ ] Show which event you checked in to (fetch title)
 * - [ ] Manual code entry fallback if the camera fails
 */
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import FrogMascot from '../../components/FrogMascot';
import Stamp from '../../components/Stamp';
import { parseCheckinQR } from './qrPayload';

const READER_ID = 'leap-qr-reader';

export default function ScanPage() {
  /** @type {import('react').MutableRefObject<Html5Qrcode | null>} */
  const scannerRef = useRef(null);
  const [status, setStatus] = useState(
    /** @type {'idle' | 'scanning' | 'checking' | 'success' | 'error'} */ ('idle'),
  );
  const [message, setMessage] = useState('');

  // Stop the camera when leaving the page.
  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      if (s?.isScanning) s.stop().catch(() => {});
    };
  }, []);

  function getScanner() {
    if (!scannerRef.current) scannerRef.current = new Html5Qrcode(READER_ID);
    return scannerRef.current;
  }

  /** @param {string} text */
  async function submit(text) {
    const parsed = parseCheckinQR(text);
    if (!parsed) {
      setStatus('error');
      setMessage("That isn't a JMU LEAP check-in code.");
      return;
    }
    setStatus('checking');
    const { error } = await supabase.rpc('check_in', {
      p_event_id: parsed.eventId,
      p_code: parsed.code,
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('success');
      setMessage("You're checked in! Stay until the end so your FROG can confirm you.");
    }
  }

  async function startCamera() {
    setMessage('');
    try {
      const scanner = getScanner();
      setStatus('scanning');
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, async (text) => {
        await scanner.stop().catch(() => {});
        submit(text);
      });
    } catch {
      setStatus('error');
      setMessage('Could not open the camera. Try uploading a photo instead (camera needs HTTPS).');
    }
  }

  /** @param {import('react').ChangeEvent<HTMLInputElement>} e */
  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const scanner = getScanner();
      if (scanner.isScanning) await scanner.stop();
      const text = await scanner.scanFile(file, false);
      submit(text);
    } catch {
      setStatus('error');
      setMessage('No QR code found in that photo.');
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-extrabold text-frog-900">Check in</h1>
      <p className="text-sm text-neutral-500">
        Scan the QR code on your FROG&apos;s phone. It changes every 20 seconds.
      </p>

      <div
        id={READER_ID}
        className={`overflow-hidden rounded-2xl bg-neutral-900 ${status === 'scanning' ? 'min-h-64' : 'hidden'}`}
      />

      {status === 'success' && (
        <div className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-frog-50 p-6 text-center">
          <Stamp className="top-3 right-3" />
          <FrogMascot mood="cheer" size={120} />
          <p className="mt-2 font-semibold text-frog-800">{message}</p>
        </div>
      )}
      {status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {message}
        </p>
      )}
      {status === 'checking' && <p className="text-sm text-neutral-500">Checking you in…</p>}

      <div className="grid gap-3">
        {status === 'scanning' ? (
          <Button
            variant="secondary"
            onClick={() => scannerRef.current?.stop().then(() => setStatus('idle'))}
          >
            Stop camera
          </Button>
        ) : (
          <Button onClick={startCamera}>Open camera</Button>
        )}
        <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-frog-600 px-5 py-3 text-base font-semibold text-frog-700 hover:bg-frog-50">
          Upload a photo of the QR
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
        </label>
      </div>
    </div>
  );
}
