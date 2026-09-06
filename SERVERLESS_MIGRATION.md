# Kharcha — Vercel Serverless Architecture

The separate Express backend is no longer required for deployment.

## Runtime flow

Browser -> Next.js frontend on Vercel -> `/api/v1/*` Route Handlers (Vercel Functions) -> MongoDB Atlas

## Environment variables

Configure these in Vercel Project Settings -> Environment Variables:

- `MONGO_URI`
- `JWT_SECRET`

Do not use `NEXT_PUBLIC_MONGO_URI`, `NEXT_PUBLIC_JWT_SECRET`, or expose either secret to the browser.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

The frontend now calls relative URLs such as `/api/v1/auth/login` and `/api/v1/transactions`, so no backend URL or CORS configuration is required.

## Deployment

Deploy this `kharcha-next` folder as the Vercel project root. Vercel detects the Next.js App Router and deploys Route Handlers as server-side Functions.

The old `Kharcha-main/server` Express project is kept only as a reference in the original source archive; it is not required by this serverless version.
