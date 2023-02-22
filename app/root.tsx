import {
  type LinksFunction,
  type MetaFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import {Seo} from '@shopify/hydrogen';
import type {Shop} from '@shopify/hydrogen/storefront-api-types';
import styles from './styles/app.css';
import favicon from '../public/favicon.svg';
import {Layout} from './components/Layout';
import {json} from 'react-router';
import {Buffer} from 'buffer';

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
});

const isAuthorized = (request: Request) => {
  const header = request.headers.get('Authorization');
  if (!header) return false;
  const base64 = header.replace('Basic ', '');
  const [username, password] = Buffer.from(base64, 'base64')
    .toString()
    .split(':');
  return username === 'admin' && password === 'password';
};

export async function loader({context, request}: LoaderArgs) {
  const cartId = await context.session.get('cartId');

  console.log(isAuthorized(request));

  if (!isAuthorized(request)) {
    return json({authorized: false}, {status: 401});
  }

  return defer({
    authorized: true,
    cart: cartId ? getCart(context, cartId) : undefined,
    layout: await context.storefront.query(LAYOUT_QUERY),
  });
}

import {ShopifyProvider} from '@shopify/hydrogen-react';
import {defer} from '@shopify/remix-oxygen';
import {CART_QUERY} from '~/queries/cart';

const shopifyConfig = {
  storefrontToken: '3b580e70970c4528da70c98e097c2fa0',
  storeDomain: 'https://hydrogen-preview.myshopify.com',
  storefrontApiVersion: '2023-01',
  countryIsoCode: 'US',
  languageIsoCode: 'en',
};
export default function App() {
  const {authorized} = useLoaderData<typeof loader>();
  if (!authorized) {
    return <>Authorization Required</>;
  }

  const data = useLoaderData<typeof loader>();
  const {name} = data.layout.shop;

  return (
    <ShopifyProvider {...shopifyConfig}>
      <html lang="en">
        <head>
          <Seo />
          <Links />
          <Meta />
        </head>
        <body>
          <Layout title={name}>
            <Outlet />
          </Layout>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </ShopifyProvider>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout {
    shop {
      name
      description
    }
  }
`;

async function getCart({storefront}, cartId) {
  if (!storefront) {
    throw new Error('missing storefront client in cart query');
  }

  const {cart} = await storefront.query(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}
