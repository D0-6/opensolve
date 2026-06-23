const cheerio = require("cheerio");

async function run() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node inspect-source.js <url>");
    process.exit(1);
  }

  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    console.log(`Fetched ${html.length} bytes.`);
    
    const $ = cheerio.load(html);
    
    if (url.includes("apply-for-innovation-funding.service.gov.uk")) {
      console.log("Testing UK Innovation Selectors...");
      $("li.search-result, .search-results > li, h2 > a").slice(0, 3).each((_, el) => {
        const aTag = $(el).is("a") ? $(el) : $(el).find("h2 a").first();
        if (!aTag.length) return;
        console.log("- Title:", aTag.text().trim());
        const container = $(el).is("a") ? $(el).parent().parent() : $(el);
        console.log("- Desc:", container.find("p").first().text().trim().substring(0, 60) + "...");
        console.log("- Full Text Snippet:", container.text().replace(/\s+/g, ' ').substring(0, 100));
        console.log("---");
      });
    } else if (url.includes("sprind.org")) {
      console.log("Testing SPRIND Selectors...");
      let found = 0;
      $("a").each((_, el) => {
        const text = $(el).text().replace(/\s+/g, " ").trim();
        if (text.includes("View challenge") && found < 3) {
          found++;
          console.log("- Match Text:", text.substring(0, 100) + "...");
        }
      });
    } else {
      console.log("No specific test cases for this URL, printing title...");
      console.log($("title").text());
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
