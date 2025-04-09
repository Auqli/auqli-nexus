import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request, {
    async afterAuth({ session }) {
      const shop = session.shop;
      const host = session.host;

      // ✅ Final redirect to your frontend app with params
      return redirect(`https://nexus.auqli.com/auqli-tools?shop=${shop}&host=${host}`);
    },
  });

  return null;
};
