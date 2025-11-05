import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #9ca3af 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Maryland Food Bank
          </h1>
          <p className="text-gray-600">
            Purchase Forecasting System
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border border-gray-200 rounded-lg bg-white text-black",
            },
          }}
          routing="path"
          path="/auth/register"
          signInUrl="/auth/login"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
