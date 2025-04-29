export function WooCommerceSampleCSV() {
  return (
    <div className="overflow-x-auto bg-[#1a2235] p-3 rounded-md text-xs">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 px-3 text-left text-[#8696ee]">Name</th>
            <th className="py-2 px-3 text-left text-[#8696ee]">Description</th>
            <th className="py-2 px-3 text-left text-[#8696ee]">Regular Price</th>
            <th className="py-2 px-3 text-left text-[#8696ee]">Sale Price</th>
            <th className="py-2 px-3 text-left text-[#8696ee]">Stock Quantity</th>
            <th className="py-2 px-3 text-left text-[#8696ee]">Categories</th>
            <th className="py-2 px-3 text-left text-[#8696ee]">Images</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          <tr className="border-b border-gray-800">
            <td className="py-2 px-3">Samsung N20 Ultra 128gb</td>
            <td className="py-2 px-3">The Samsung Galaxy Note 20 Ultra 128GB...</td>
            <td className="py-2 px-3">490,000</td>
            <td className="py-2 px-3">460,000.00</td>
            <td className="py-2 px-3">5</td>
            <td className="py-2 px-3">samsung</td>
            <td className="py-2 px-3">https://example.com/images/n20.jpg</td>
          </tr>
          <tr className="border-b border-gray-800">
            <td className="py-2 px-3">iPhone 13 Pro 256GB</td>
            <td className="py-2 px-3">The iPhone 13 Pro features...</td>
            <td className="py-2 px-3">550,000</td>
            <td className="py-2 px-3">520,000.00</td>
            <td className="py-2 px-3">3</td>
            <td className="py-2 px-3">apple, iphone</td>
            <td className="py-2 px-3">https://example.com/images/iphone.jpg</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
