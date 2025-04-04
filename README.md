# auqli-csv-formatter

Convert Shopify product CSV files seamlessly into the **Auqli** format for fast imports and smooth selling experiences.

[👉 Try the tool here](https://auqli-switch.vercel.app/)

---

## About

**auqli-csv-formatter** is a handy tool built to help sellers transition their Shopify product catalogs directly into Auqli’s import-ready format. With just a few clicks, sellers can upload their Shopify export file and instantly get a clean, Auqli-compatible CSV—saving time and ensuring accuracy.

Whether you’re migrating your store or setting up new products on Auqli, this tool makes the process effortless.

---

## Features

- ✅ Upload Shopify product CSV
- ✅ Instant conversion to Auqli format
- ✅ Download the Auqli-compatible CSV file
- ✅ Handles product variants and details accurately
- ✅ Simplifies bulk uploads for sellers

---

## How It Works

1. **Export Products from Shopify**
   - Go to your Shopify admin.
   - Export your product catalog as a `.csv` file.

2. **Upload to auqli-csv-formatter**
   - Use the upload feature in the app to select your Shopify CSV file.

3. **Convert & Download**
   - The tool will automatically convert your file to the Auqli CSV structure.
   - Download the ready-to-import Auqli CSV.

4. **Import into Auqli**
   - Log into [Auqli](https://auqli.live) and upload your formatted CSV to start selling!

---

## Field Mapping (Shopify ➡️ Auqli)

| Shopify Field              | Auqli Field            |
|---------------------------|------------------------|
| Title                     | Product Name           |
| Body (HTML)               | Product Description    |
| Variant Price             | Price                  |
| Variant SKU               | SKU                    |
| Variant Inventory Qty     | Quantity in Stock      |
| Image Src                 | Product Images         |
| Option1 Name / Value      | Variant Options        |
| Tags                      | Product Tags           |
| Vendor                    | Brand / Manufacturer   |
| Published                 | Visibility Status      |


---

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js
- **CSV Parsing:** PapaParse

---

## Roadmap

- [ ] Support for more e-commerce CSV formats (e.g., WooCommerce, Magento)
- [ ] Auto-mapping for custom fields
- [ ] API for bulk processing
- [ ] Drag & drop upload
- [ ] Progress indicator / success notification

---

## Contributing

We welcome contributions! If you’d like to suggest a feature, fix a bug, or improve the tool, please feel free to open an issue or submit a pull request.

---

## License

MIT License — free for personal and commercial use.

---

## Questions or Support?

If you need help, feel free to reach out:

- **Email:** support@auqli.live
- **Website:** [Auqli](https://auqli.live)

---

_A project by Auqli. Simplifying the future of social commerce._ 🚀
