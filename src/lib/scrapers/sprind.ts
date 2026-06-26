import * as cheerio from "cheerio";

export async function scrapeSprind() {
  const url = "https://www.sprind.org/en";
  
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

    // Find all links
    $("a").each((_, element) => {
      const aTag = $(element);
      const fullText = aTag.text().replace(/\s+/g, " ").trim();
      
      // Only extract blocks ending in "View challenge"
      if (!fullText.includes("View challenge")) {
        return;
      }

      // From that link's text, extract: title (text before "Open for applications")
      let title = "";
      let description = "";
      let deadline: string | null = null;
      let postedDate = "";

      const openForAppsIndex = fullText.indexOf("Open for applications");
      if (openForAppsIndex !== -1) {
        title = fullText.substring(0, openForAppsIndex).trim();
        const afterOpenForApps = fullText.substring(openForAppsIndex + "Open for applications".length).trim();
        
        // date after "Open for applications"
        // Usually something like "15 March 2026"
        // Let's just find where the description starts.
        // Easiest is to regex match date formats
        const dateMatch = afterOpenForApps.match(/^([\d]{1,2}\s+[a-zA-Z]+\s+[\d]{4})/);
        if (dateMatch) {
          postedDate = dateMatch[1];
        }
        
        const descriptionStart = dateMatch ? dateMatch[1].length : 0;
        
        const deadlineMatch = fullText.match(/Deadline for submissions is\s*([\d]{1,2}\s+[a-zA-Z]+\s+[\d]{4})/i);
        if (deadlineMatch) {
          const dlString = deadlineMatch[1];
          try {
            const parsed = new Date(dlString);
            if (!isNaN(parsed.getTime())) {
              deadline = parsed.toISOString();
            }
          } catch(e) {}
        }
        
        let endDescIndex = fullText.indexOf("Deadline for submissions is");
        if (endDescIndex === -1) {
          endDescIndex = fullText.indexOf("View challenge");
        }
        
        // The description is text between date and Deadline/View Challenge
        const rawDesc = afterOpenForApps.substring(descriptionStart);
        const relativeEnd = rawDesc.indexOf("Deadline for submissions is") !== -1 
          ? rawDesc.indexOf("Deadline for submissions is") 
          : rawDesc.indexOf("View challenge");
          
        description = rawDesc.substring(0, relativeEnd).trim();
      }

      let sourceUrl = aTag.attr("href") || "";
      if (sourceUrl.startsWith("/")) {
        sourceUrl = `https://www.sprind.org${sourceUrl}`;
      } else if (!sourceUrl.startsWith("http")) {
        sourceUrl = `https://www.sprind.org/${sourceUrl}`;
      }

      if (title) {
        problems.push({
          title,
          description,
          source: "GOVERNMENT",
          sourceUrl,
          domain: "Germany — SPRIND",
          prizeType: "PILOT_FUNDING",
          prizeAmount: null,
          deadline,
        });
      }
    });

    return problems;
  } catch (error) {
    console.error("Error scraping SPRIND:", error);
    return [];
  }
}
