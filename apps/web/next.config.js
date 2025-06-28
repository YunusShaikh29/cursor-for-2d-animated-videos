/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, 
  transpilePackages: ["@repo/ui", "database", "shared", "@repo/typescript-config", "@repo/eslint-config"], 

  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    NEXT_PUBLIC_EXPRESS_URL: process.env.NEXT_PUBLIC_EXPRESS_URL,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    BUCKET_NAME: process.env.BUCKET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY, 
    BYPASS_LLM_CALL: process.env.BYPASS_LLM_CALL,
    NODE_ENV: process.env.NODE_ENV
  },
};

export default nextConfig;