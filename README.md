# Documentation Quality Analyzer

A comprehensive web-based tool for technical writers to analyze and improve documentation quality. This tool provides automated analysis of document structure, readability, cross-references, style compliance, and terminology consistency.

## Features

### 🔍 Document Analysis
- **Structure Analysis**: Checks heading hierarchy, missing sections, and document organization
- **Readability Scoring**: Flesch-Kincaid grade level analysis and sentence complexity
- **Link Validation**: Verifies internal and external links (placeholder for future implementation)
- **Style Compliance**: Identifies common writing issues and style violations
- **Terminology Consistency**: Tracks term usage and identifies inconsistencies

### ⚙️ Configurable Settings
- **Expected Sections**: Define required and optional sections for your documentation
- **Quality Targets**: Set custom targets for readability, structure, and overall scores
- **Style Guide**: Enable/disable specific checks and create custom rules
- **Readability Targets**: Configure Flesch-Kincaid targets and sentence length limits
- **Terminology Glossary**: Define preferred terms and their alternatives

### 📊 Quality Dashboard
- Real-time quality metrics and scoring
- Visual progress tracking
- Issue identification and suggestions
- Historical trends and improvements

### 💡 Smart Suggestions
- Actionable recommendations for improvement
- Best practices for technical writing
- Structure and hierarchy guidance
- Readability enhancement tips

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build**: Modern React 19 with server components

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository or download the source code
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Upload a Document**: Click "Choose File" to upload a `.txt` or `.md` file, or paste content directly into the text area
2. **Configure Settings**: Click "Settings" to customize:
   - **Expected Sections**: Add required/optional sections for your documentation
   - **Quality Targets**: Set minimum score targets for different analysis areas
   - **Style Guide**: Enable/disable specific checks and add custom rules
   - **Readability**: Configure Flesch-Kincaid targets and sentence length limits
   - **Glossary**: Define preferred terminology and alternatives
3. **Analyze**: Click "Analyze Document" to run the quality analysis
4. **Review Results**: View the comprehensive analysis including:
   - Overall quality score
   - Structure and hierarchy issues
   - Readability metrics
   - Style compliance findings
   - Suggested improvements
5. **Track Progress**: Use the dashboard to monitor quality trends and improvements

## Analysis Features

### Structure Analysis
- Heading hierarchy validation (H1 → H2 → H3 structure)
- Missing section detection
- Empty heading identification
- Duplicate heading detection
- Common section recommendations

### Readability Analysis
- Flesch-Kincaid grade level calculation
- Average sentence length analysis
- Complex word identification
- Reading level assessment
- Actionable readability improvements

### Style Compliance
- Common writing issue detection
- Passive voice identification
- Link text best practices
- Terminology consistency
- Professional writing guidelines

### Link Validation (Future Enhancement)
- Internal link verification
- External link checking
- Broken link identification
- Link text optimization

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page component
├── components/         # React components
│   ├── Dashboard.tsx   # Quality metrics dashboard
│   ├── DocumentAnalyzer.tsx  # Main analysis interface
│   └── Header.tsx      # Application header
├── lib/                # Utility functions
│   └── analyzer.ts     # Core analysis logic
└── types/              # TypeScript definitions
    └── index.ts        # Type definitions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Building for Production

```bash
npm run build
npm run start
```

## Contributing

This tool is designed for technical writers and documentation teams. Contributions are welcome for:

- Additional analysis features
- Improved readability algorithms
- Enhanced style checking
- Better user interface
- Performance optimizations

## Future Enhancements

- [ ] Real-time link validation
- [ ] Advanced grammar checking
- [x] Custom style guide configuration
- [x] Configurable quality targets
- [x] User-defined expected sections
- [ ] Multi-document analysis
- [ ] Team collaboration features
- [ ] Export functionality
- [ ] Integration with documentation platforms
- [ ] Drag-and-drop section reordering
- [ ] Import/export of settings configurations

## Accessibility

This tool has been designed with accessibility in mind:

- **High Contrast Text**: All form fields and interactive elements use high contrast colors for better readability
- **Clear Typography**: Readable font sizes and weights throughout the interface
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Compatible**: Proper ARIA labels and semantic HTML structure
- **Color Coding**: Visual indicators supplemented with text labels
- **Responsive Design**: Works well across different screen sizes and zoom levels

## License

This project is available for use and modification. See the project files for implementation details.

---

Built with ❤️ for technical writers and documentation teams.
