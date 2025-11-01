import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-10">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white text-black",
          },
        }}
        routing="path"
        path="/auth/login"
        signUpUrl="/auth/register"
        redirectUrl="/"
      />
    </div>
  );
}
