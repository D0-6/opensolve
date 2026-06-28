const fs = require('fs');
let c = fs.readFileSync('scripts/create-tables.js', 'utf8');

c = c.replace(/ProvisionedThroughput:\s*\{\s*ReadCapacityUnits:\s*1,\s*WriteCapacityUnits:\s*1\s*\}/g, '');
c = c.replace(/,\s*\}/g, '}');
c = c.replace(/BillingMode:\s*"PROVISIONED"/g, 'BillingMode: "PAY_PER_REQUEST"');

fs.writeFileSync('scripts/create-tables.js', c);
