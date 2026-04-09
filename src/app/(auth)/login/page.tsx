import Link from "next/link"
import { login } from "../actions"
import { Button } from "@/components/ui/button"
import { MountainIcon } from "@/components/ui/MountainIcon"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-muted/20 px-4">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 group"
      >
        <MountainIcon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
        <span className="text-xl font-bold tracking-tight">Crux</span>
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] bg-background p-8 rounded-2xl shadow-xl shadow-primary/5 border">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to log in
          </p>
        </div>

        <form className="grid gap-4" action={login}>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              Email
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="email"
              name="email"
              placeholder="m@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              Password
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <Button className="w-full mt-2 font-semibold" type="submit">
            Log in
          </Button>
          {message && (
            <p className="text-sm text-center font-medium text-destructive mt-4">
              {message}
            </p>
          )}
        </form>

        <p className="px-8 text-center text-sm text-muted-foreground pt-4 border-t">
          <Link
            href="/signup"
            className="hover:text-primary underline underline-offset-4"
          >
            Don't have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
