export function ShopifySampleCSV() {
  return (
    <div className="relative overflow-hidden rounded-md bg-[#0a0f1a] p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400">shopify_products_export.csv</span>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <table className="min-w-full text-xs text-left text-gray-300 font-mono">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 pr-4 text-[#45c133]">Handle</th>
              <th className="py-2 pr-4 text-[#45c133]">Title</th>
              <th className="py-2 pr-4 text-[#45c133]">Body (HTML)</th>
              <th className="py-2 pr-4 text-[#45c133]">Vendor</th>
              <th className="py-2 pr-4 text-[#45c133]">Product Category</th>
              <th className="py-2 pr-4 text-[#45c133]">Type</th>
              <th className="py-2 pr-4 text-[#45c133]">Tags</th>
              <th className="py-2 pr-4 text-[#45c133]">Published</th>
              <th className="py-2 pr-4 text-[#45c133]">Image Src</th>
              <th className="py-2 pr-4 text-[#45c133]">Image Position</th>
              <th className="py-2 pr-4 text-[#45c133]">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 pr-4">t-shirt</td>
              <td className="py-2 pr-4">Premium T-Shirt</td>
              <td className="py-2 pr-4">&lt;p&gt;High-quality cotton t-shirt with logo print.&lt;/p&gt;</td>
              <td className="py-2 pr-4">Auqli</td>
              <td className="py-2 pr-4">Apparel &amp; Accessories &gt; Clothing &gt; Shirts</td>
              <td className="py-2 pr-4">T-Shirts</td>
              <td className="py-2 pr-4">cotton,premium</td>
              <td className="py-2 pr-4">TRUE</td>
              <td className="py-2 pr-4">https://example.com/tshirt.jpg</td>
              <td className="py-2 pr-4">1</td>
              <td className="py-2 pr-4">active</td>
            </tr>
            <tr className="bg-[#111827]/30">
              <td className="py-2 pr-4">t-shirt</td>
              <td className="py-2 pr-4">Premium T-Shirt</td>
              <td className="py-2 pr-4">&lt;p&gt;High-quality cotton t-shirt with logo print.&lt;/p&gt;</td>
              <td className="py-2 pr-4">Auqli</td>
              <td className="py-2 pr-4">Apparel &amp; Accessories &gt; Clothing &gt; Shirts</td>
              <td className="py-2 pr-4">T-Shirts</td>
              <td className="py-2 pr-4">cotton,premium</td>
              <td className="py-2 pr-4">TRUE</td>
              <td className="py-2 pr-4">https://example.com/tshirt-back.jpg</td>
              <td className="py-2 pr-4">2</td>
              <td className="py-2 pr-4">active</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0f1a] to-transparent pointer-events-none"></div>
    </div>
  )
}
