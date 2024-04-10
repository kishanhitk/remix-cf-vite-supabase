import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "./app.css?url";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  return json({
    env: {
      VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export type RootContext = {
  supabase: SupabaseClient<Database>;
};
export default function App() {
  const { env } = useLoaderData<typeof loader>();
  const supabase = createBrowserClient<Database>(
    env.VITE_SUPABASE_URL!,
    env.VITE_SUPABASE_ANON_KEY!
  );

  return (
    <Outlet
      context={{
        supabase,
      }}
    />
  );
}
