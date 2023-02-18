import {useLoaderData, Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';

import type {CollectionConnection} from '@shopify/hydrogen/storefront-api-types';
import {LoaderArgs} from '@shopify/remix-oxygen';

// コレクションの取得用のGraphQL
const COLLECTIONS_QUERY = `#graphql
  query FeaturedCollections {
    collections(first: 3, query: "collection_type:smart") {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;

// ローダー関数についてはここを参照
// https://remix.run/docs/en/v1/route/loader
export async function loader({context}: LoaderArgs) {
  return await context.storefront.query(COLLECTIONS_QUERY);
}

// meta関数
// https://remix.run/docs/en/v1/route/meta#metav2
export const meta = () => {
  return {
    title: 'Hydrogen TOP',
    description: 'A custom storefront powered by Hydrogen',
  };
};

const Index = () => {
  // Collectionを取得
  const {collections}: {collections: CollectionConnection} =
    useLoaderData<typeof loader>();

  // 画像とリンク先などをレンダリングする
  return (
    <section className="w-full gap-4">
      <h2 className="whitespace-pre-wrap max-w-prose font-bold text-lead">
        Collections
      </h2>
      <div className="grid-flow-row grid gap-2 gap-y-6 md:gap-4 lg:gap-6 grid-cols-1 false  sm:grid-cols-3 false false">
        {collections.nodes.map((collection) => {
          return (
            <Link to={`/collections/${collection.handle}`} key={collection.id}>
              <div className="grid gap-4">
                {collection?.image && (
                  <Image
                    alt={`Image of ${collection.title}`}
                    data={collection.image}
                    key={collection.id}
                    sizes="(max-width: 32em) 100vw, 33vw"
                    widths={[400, 500, 600, 700, 800, 900]}
                    loaderOptions={{
                      scale: 2,
                      crop: 'center',
                    }}
                  />
                )}
                <h2 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                  {collection.title}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Index;
