import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-10">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white text-black",
          },
        }}
        routing="path"
        path="/auth/register"
        signInUrl="/auth/login"
        redirectUrl="/"
      />
    </div>
  );
}
