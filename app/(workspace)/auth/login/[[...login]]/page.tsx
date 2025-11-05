import { SignIn } from "@clerk/nextjs";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface LoginPageProps {
  searchParams?: SearchParams;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirectParam = params.redirect_url;
  const redirectUrl =
    typeof redirectParam === "string" && redirectParam.length > 0
      ? redirectParam
      : "/items";
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

        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border border-gray-200 rounded-lg bg-white text-black",
            },
          }}
          routing="path"
          path="/auth/login"
          signUpUrl="/auth/register"
          redirectUrl={redirectUrl}
          afterSignInUrl={redirectUrl}
        />
      </div>
    </div>
  );
}
