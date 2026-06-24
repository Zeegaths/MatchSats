"use client";
import NotificationToast from "./NotificationToast";

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NotificationToast />
    </>
  );
}
