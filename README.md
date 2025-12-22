# 11ty Neocities

A personal website built with [Eleventy (11ty)](https://www.11ty.dev/) for hosting on [Neocities](https://neocities.org/).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation

```bash
npm install
```

### Development

Run the local development server with hot-reloading:

```bash
npm start
```

Your site will be available at `http://localhost:8080`

### Build

Generate the production-ready static site:

```bash
npm run build
```

The output will be in the `_site/` directory.

## Project Structure

```
├── _site/           # Generated output (git-ignored)
├── src/             # Source files
│   ├── _data/       # Global data files
│   ├── _includes/   # Layouts and partials
│   └── ...          # Your pages and content
├── .eleventy.js     # 11ty configuration
└── package.json
```

## Deployment

The `_site/` directory can be uploaded directly to Neocities, either manually or using the [Neocities CLI](https://neocities.org/cli).

```bash
# Install Neocities CLI
gem install neocities

# Deploy
neocities push _site/
```

## Resources

- [11ty Documentation](https://www.11ty.dev/docs/)
- [Neocities](https://neocities.org/)
