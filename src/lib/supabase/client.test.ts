import { expect, test, describe, mock, beforeEach, afterEach } from "bun:test";

const mockCreateBrowserClient = mock(() => ({}));
mock.module("@supabase/ssr", () => ({
  createBrowserClient: mockCreateBrowserClient,
}));

describe("createClient", () => {
  const originalEnv = { ...process.env };
  let createClient: any;

  beforeEach(async () => {
    // Reset process.env before each test
    for (const key in process.env) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
    mockCreateBrowserClient.mockClear();

    // Dynamically import to ensure mock is applied
    const module = await import("./client");
    createClient = module.createClient;
  });

  afterEach(() => {
    // Restore process.env after each test
    for (const key in process.env) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  test("should throw an error when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    expect(() => createClient()).toThrow("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });

  test("should throw an error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createClient()).toThrow("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });

  test("should create client when environment variables are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const client = createClient();
    expect(client).toBeDefined();
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key"
    );
  });
});
