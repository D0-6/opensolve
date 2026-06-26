import * as cheerio from "cheerio";

// Confirmed legal to reuse — page states 'All content is available under the Open Government Licence v3.0'
export async function scrapeUKInnovation() {
  // Full pagination is a Phase 2 improvement. We only fetch page=0 for the hackathon scope (first 10 results).
  const url = "https://apply-for-innovation-funding.service.gov.uk/competition/search";
  
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OpenSolve-Scraper/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const problems: Record<string, unknown>[] = [];

    $("li.search-result, .search-results > li, h2 > a").each((_, element) => {
      // Find each "## [...]({url})" heading
      // The heading is an h2 containing an a tag, or we are looping over list items containing the h2
      const aTag = $(element).is("a") ? $(element) : $(element).find("h2 a").first();
      
      if (!aTag.length) return;

      const title = aTag.text().trim();
      let sourceUrl = aTag.attr("href") || "";
      if (sourceUrl.startsWith("/")) {
        sourceUrl = `https://apply-for-innovation-funding.service.gov.uk${sourceUrl}`;
      } else if (!sourceUrl.startsWith("http")) {
        sourceUrl = `https://apply-for-innovation-funding.service.gov.uk/${sourceUrl}`;
      }

      // Description is the paragraph text immediately following the heading
      const container = $(element).is("a") ? $(element).parent().parent() : $(element);
      const description = container.find("p").first().text().trim();

      // Parse prizeAmount: "£X million" or "£X,000"
      let prizeAmount = null;
      const millionMatch = description.match(/£([\d.]+)\s*million/i);
      const thousandsMatch = description.match(/£([\d,]+)/);
      
      if (millionMatch && millionMatch[1]) {
        prizeAmount = parseFloat(millionMatch[1]) * 1000000;
      } else if (thousandsMatch && thousandsMatch[1]) {
        prizeAmount = parseFloat(thousandsMatch[1].replace(/,/g, ""));
      }

      // Extract deadline: "Closes: {date}"
      let deadline: string | null = null;
      const dateText = container.text();
      const closesMatch = dateText.match(/Closes:\s*([\d]+\s+[A-Za-z]+\s+[\d]{4})/i);
      
      if (closesMatch && closesMatch[1]) {
        try {
          const parsedDate = new Date(closesMatch[1]);
          if (!isNaN(parsedDate.getTime())) {
            deadline = parsedDate.toISOString();
          }
        } catch (e) {
          // ignore date parse errors
        }
      }

      if (title) {
        problems.push({
          title,
          description,
          source: "GOVERNMENT",
          sourceUrl,
          domain: "UK Innovation Funding",
          prizeType: "PILOT_FUNDING",
          prizeAmount,
          deadline,
        });
      }
    });

    return problems;
  } catch (error) {
    console.error("Error scraping UK Innovation:", error);
    return [];
  }
}
