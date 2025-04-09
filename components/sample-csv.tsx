export function ShopifySampleCSV() {
  return (
    <div className="relative overflow-hidden rounded-md bg-[#0a0f1a] p-3 border border-gray-700 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1.5"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400">shopify_products_export.csv</span>
      </div>

      <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="min-w-max">
          <table className="w-full text-xs text-left text-gray-300 font-mono">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-1.5 px-2 text-[#45c133] whitespace-nowrap">Handle</th>
                <th className="py-1.5 px-2 text-[#45c133] whitespace-nowrap">Title</th>
                <th className="py-1.5 px-2 text-[#45c133] whitespace-nowrap">Body (HTML)</th>
                <th className="py-1.5 px-2 text-[#45c133] whitespace-nowrap">Vendor</th>
                <th className="py-1.5 px-2 text-[#45c133] whitespace-nowrap">Product Category</th>
                <th className="py-1.5 px-2 text-[#45c133] whitespace-nowrap">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5 px-2 whitespace-nowrap">t-shirt</td>
                <td className="py-1.5 px-2 whitespace-nowrap">Premium T-Shirt</td>
                <td className="py-1.5 px-2 whitespace-nowrap">&lt;p&gt;High-quality cotton t-shirt&lt;/p&gt;</td>
                <td className="py-1.5 px-2 whitespace-nowrap">Auqli</td>
                <td className="py-1.5 px-2 whitespace-nowrap">Apparel &gt; Clothing</td>
                <td className="py-1.5 px-2 whitespace-nowrap">T-Shirts</td>
              </tr>
              <tr className="bg-[#111827]/30">
                <td className="py-1.5 px-2 whitespace-nowrap">hoodie</td>
                <td className="py-1.5 px-2 whitespace-nowrap">Zip Hoodie</td>
                <td className="py-1.5 px-2 whitespace-nowrap">&lt;p&gt;Warm zip-up hoodie&lt;/p&gt;</td>
                <td className="py-1.5 px-2 whitespace-nowrap">Auqli</td>
                <td className="py-1.5 px-2 whitespace-nowrap">Apparel &gt; Clothing</td>
                <td className="py-1.5 px-2 whitespace-nowrap">Hoodies</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0f1a] to-transparent pointer-events-none"></div>
    </div>
  )
}
