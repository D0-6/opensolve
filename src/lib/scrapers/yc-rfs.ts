import * as cheerio from "cheerio";

export async function scrapeYCRFS() {
  const url = "https://www.ycombinator.com/rfs";
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OpenSolve-Scraper/1.0 (Integration for Hackathon)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const problems: Record<string, unknown>[] = [];

    // If YC changes their page HTML structure, this parser will need updating — this is a known fragility of scraping over an API.
    // Assuming YC RFS items are structured as articles or sections with headings and paragraphs.
    // Common structure: <h3>Title</h3> followed by <p>description</p>
    // We will extract generic sections for the hackathon prototype.
    
    $("section, article, .rfs-item").each((_, element) => {
      // Very basic extraction logic that usually catches RFS style pages
      const title = $(element).find("h2, h3, .title").first().text().trim();
      const description = $(element).find("p").first().text().trim();
      
      if (title && description && description.length > 20) {
        problems.push({
          title,
          description,
          source: "YC_STARTUP",
          sourceUrl: url, // Individual RFS entries may not have unique URLs
          domain: "Technology / Startups",
          prizeType: "PILOT_FUNDING",
          prizeAmount: null,
          deadline: null,
        });
      }
    });

    return problems;
  } catch (error) {
    console.error("Error scraping YC RFS:", error);
    // Never throw uncaught, never crash the calling route
    return [];
  }
}
