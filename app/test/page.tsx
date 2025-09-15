import Image from "next/image";
import React from "react";

const Page = () => {
  const qrToken = "82e66da1-6c20-4ac3-bfa4-2caabf61d2a2_1757863662508";

  // ✅ Just use a relative path so it matches the current domain/port
  const qrImageUrl = `/api/qr/image/${qrToken}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <p>QR Code for token: {qrToken}</p>

      <Image
        alt="QR Code"
        src={qrImageUrl}
        height={200}
        width={200}
        unoptimized
        priority
      />

      {/* Fallback if needed */}
      <img src={qrImageUrl} alt="QR Code" width={200} height={200} />
    </div>
  );
};

export default Page;
