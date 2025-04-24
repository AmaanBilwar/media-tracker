import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";

export default function AuthButtons() {
  return (
    <>
      <SignedOut>
        <SignInButton />
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
} 