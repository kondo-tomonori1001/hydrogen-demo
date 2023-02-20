import {useFetcher} from '@remix-run/react';
import {useEffect, useState} from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({collection, url}) => {
  const fetcher = useFetcher();
  const fetchMoreProducts = () => {
    fetcher.load(`${url}?index&cursor=${endCursor}`);
  };

  // 商品データ
  const [products, setProducts] = useState(collection.products.nodes || []);
  // endCursor（次の商品取得のパラメーター）
  const [endCursor, setEndCursor] = useState(
    collection.products.pageInfo.endCursor,
  );
  // 次ページの有無
  const [nextPage, setNextPage] = useState(
    collection.products.pageInfo.hasNextPage,
  );

  useEffect(() => {
    if (!fetcher.data) return;
    const {collection} = fetcher.data;

    setProducts((prev) => [...prev, ...collection.products.nodes]);
    setEndCursor(collection.products.pageInfo.endCursor);
    setNextPage(collection.products.pageInfo.hasNextPage);
  }, [fetcher.data]);
  return (
    <section className="w-full gap-4 md:gap-8 grid">
      <div className="grid-flow-row grid gap-2 gap-y-6 md:gap-4 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
      {nextPage && (
        <div className="flex items-center justify-center mt-6">
          <button
            onClick={fetchMoreProducts}
            disabled={fetcher.state !== 'idle'}
            className="inline-block rounded font-medium text-center py-3 px-6 border w-full cursor-pointer"
          >
            {fetcher.state !== 'idle' ? 'Loading...' : 'Load more products'}
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
