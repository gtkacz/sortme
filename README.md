# sort.me

A lightweight, browser-based tool for sorting and managing lists with ease.

## Features

- **Instant alphabetical sorting** of entered text
- **Smart separator detection** (automatically detects commas, semicolons, or newlines)
- **Custom separator support** for specialized formats
- **Drag and drop reordering** for manual list arrangement
- **Multi-select functionality** for batch operations
- **Shareable URLs** to save and share your lists
- **Copy to clipboard** for selected items
- **Batch deletion** of selected items
- **Index display toggle** for numbered lists
- **Reset functionality** to revert to original sort order
- **Mobile-friendly responsive design**
- **No server requirements** - runs entirely in the browser

## Live Demo

Visit [sort.me](https://your-username.github.io/sortme/) to try it out!

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sortme.git
   cd sortme
   ```

2. Install dependencies:
   ```bash
   npm ci
   # or
   yarn install --frozen-lockfile
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
# or
yarn build
```

The production files will be generated in the `dist` directory.

## Project Structure

```
├── assets/
│   ├── img/            # Images and icons
│   └── static/         # Static CSS and JavaScript files
├── index.html          # Main HTML file
├── .gitignore          # Git ignore file
├── LICENSE             # MIT License file
├── README.md           # This file
└── package.json        # Project dependencies and scripts
```

## How It Works

1. Enter your list items in the textarea
2. Items are automatically sorted alphabetically
3. Drag items to manually reorder them
4. Use the checkboxes to select items for actions (copy/delete)
5. Use the toolbar buttons to perform actions on selected items
6. Share your list using the share button (creates a shareable URL)

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Fonts](https://developers.google.com/fonts) - For the Space Grotesk, Lexend, and Mona Sans fonts
- [Tabler Icons](https://tabler.io/icons) - For the icon set
- [Simple Icons](https://simpleicons.org/) - For brand icons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request