import { Suspense } from "react";
import { AppointmentPageContent } from "./AppointmentContent";

export default function AppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    }>
      <AppointmentPageContent />
    </Suspense>
  );
}