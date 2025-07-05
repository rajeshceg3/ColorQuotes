const fs = require('fs');
const path = require('path');

const quotesFilePath = path.join(__dirname, '..', 'src', 'data', 'quotes.json');

try {
  // Read the quotes.json file
  const fileContent = fs.readFileSync(quotesFilePath, 'utf8');
  const quotesData = JSON.parse(fileContent);

  // Ensure quotes and metadata exist
  if (!quotesData.quotes || !quotesData.metadata) {
    console.error('Error: Invalid quotes.json format. Missing "quotes" or "metadata" key.');
    process.exit(1);
  }

  // Calculate total_quotes
  const totalQuotes = quotesData.quotes.length;

  // Generate categories
  const categories = quotesData.quotes.reduce((acc, quote) => {
    if (quote.category) {
      acc[quote.category] = (acc[quote.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Update metadata
  quotesData.metadata.total_quotes = totalQuotes;
  quotesData.metadata.categories = categories;
  quotesData.metadata.last_updated = new Date().toISOString();

  // Write the updated JSON back to the file
  fs.writeFileSync(quotesFilePath, JSON.stringify(quotesData, null, 2), 'utf8');

  console.log('Successfully updated quotes.json metadata.');
  console.log(`  Total quotes: ${totalQuotes}`);
  console.log(`  Categories: ${JSON.stringify(categories)}`);
  console.log(`  Last updated: ${quotesData.metadata.last_updated}`);

} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`Error: File not found at ${quotesFilePath}`);
  } else if (error instanceof SyntaxError) {
    console.error(`Error: Could not parse JSON in ${quotesFilePath}. Details: ${error.message}`);
  } else {
    console.error('An unexpected error occurred:', error);
  }
  process.exit(1);
}
