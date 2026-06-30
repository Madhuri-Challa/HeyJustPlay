import { QRCodeSVG } from "qrcode.react";

export function QRCodeBox({ value }: { value: string }) {
  return (
    <div className="grid place-items-center rounded-lg bg-white p-4">
      <QRCodeSVG value={value} size={176} level="M" />
    </div>
  );
}
