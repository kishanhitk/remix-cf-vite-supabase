import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import {
  useLoaderData,
  useOutletContext,
  useRevalidator,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { Database } from "types/supabase";
import { RootContext } from "~/root";
import { createServerSupabase } from "~/utils/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(
    request,
    context.cloudflare.env
  );
  const { data, error } = await supabase.from("todos").select("*");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(data);
  console.log(error);

  return json(
    { data, user },
    {
      headers,
    }
  );
}

export default function Index() {
  const { data, user } = useLoaderData<typeof loader>();
  const { supabase } = useOutletContext<RootContext>();
  const revlidator = useRevalidator();

  const [clientData, setClientData] =
    useState<Database["public"]["Tables"]["todos"]["Row"][]>();

  useEffect(() => {
    supabase
      .from("todos")
      .select("*")
      .then(({ data, error }) => {
        console.log({ data });
        if (error) {
          console.log(error);
          return;
        }

        setClientData(data);
      });
  }, [data, supabase]);

  useEffect(() => {
    supabase.auth.onAuthStateChange(() => {
      revlidator.revalidate();
    });
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Server Data</h1>
      {data?.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}

      <h1 className="text-h1 font-bold">Client Data</h1>
      {clientData?.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}

      {user ? (
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            supabase.auth.signOut();
          }}
        >
          Logout
        </button>
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            supabase.auth.signInWithOAuth({
              provider: "linkedin_oidc",
            });
          }}
        >
          Login with LinkedIn
        </button>
      )}

      <h1>User Info</h1>
      <p>{JSON.stringify(user)}</p>
    </div>
  );
}
