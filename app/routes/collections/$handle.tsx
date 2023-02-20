import {useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import ProductGrid from '~/components/ProductGrid';

import {LoaderArgs} from '@shopify/remix-oxygen';

export async function loader({params, context, request}: LoaderArgs) {
  const {handle} = params;
  const searchParams = new URL(request.url).searchParams;
  const cursor = searchParams.get('cursor');

  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      cursor,
    },
  });

  if (!collection) {
    throw new Response(null, {status: 404});
  }

  return json({
    collection,
  });
}

const COLLECTION_QUERY = `#graphql
query CollectionDetails($handle: String!,$cursor: String) {
  collection(handle: $handle) {
    id
    title
    description
    handle
    products(first: 4,after:$cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        publishedAt
        handle
        variants(first: 1) {
          nodes {
            id
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
}
`;

// レンダリング
const Collection = () => {
  const {collection} = useLoaderData();
  return (
    <>
      <header className="grid w-full gap-8 py-8 justify-items-start">
        <h1 className="text-4xl whitespace-pre-wrap font-bold inline-block">
          {collection.title}
        </h1>

        {collection.description && (
          <div className="flex items-baseline justify-between w-full">
            <div>
              <p className="max-w-md whitespace-pre-wrap inherit text-copy inline-block">
                {collection.description}
              </p>
            </div>
          </div>
        )}
      </header>
      <ProductGrid
        collection={collection}
        url={`/collections/${collection.handle}`}
      />
    </>
  );
};
export default Collection;

const seo = ({data}) => {
  const originDescText = data?.collection?.description;
  const descText =
    originDescText.length < 155
      ? originDescText
      : `${originDescText.substr(0, 152)}...`;
  return {
    title: data?.collection?.title,
    description: descText,
  };
};
export const handle = {
  seo,
};
