"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingCode: string;
  onSuccess: () => void;
}

export function QRScanner({ isOpen, onClose, bookingId, bookingCode, onSuccess }: QRScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        // Ask for camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop stream
      } catch (error) {
        alert("⚠️ Camera permission is required to scan QR codes.");
        return;
      }

      if (isOpen && !scanner) {
        setTimeout(() => {
          const scannerConfig = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            disableFlip: true,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.AZTEC,
              Html5QrcodeSupportedFormats.CODE_128
            ]
          };

          const newScanner = new Html5QrcodeScanner("qr-reader", scannerConfig, false);
          newScanner.render(onScanSuccess, onScanFailure);
          setScanner(newScanner);
        }, 500); // Delay for better initialization
      }
    };

    requestCameraPermission();

    return () => {
      if (scanner) {
        scanner.clear();
        setScanner(null);
      }
    };
  }, [isOpen, scanner]);

  const onScanSuccess = async (decodedText: string) => {
    if (decodedText === bookingCode) {
      try {
        const { error } = await supabase
          .from("booking")
          .update({ isArrived: "yes" })
          .eq("id", bookingId);

        if (error) throw error;

        toast.success("✅ Customer arrival confirmed!");
        onSuccess();
        onClose();
      } catch (error) {
        alert("�� Failed to update arrival status.");
      }
    } else {
      alert("❌ Invalid QR code. Please scan the correct one.");
    }
  };

  const onScanFailure = (error: any) => {
    alert(`⚠️ QR scan failed: ${error}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        {isOpen && <div id="qr-reader" className="w-full" />}
      </DialogContent>
    </Dialog>
  );
}

