var db = require('./utils/db.js');

try {
    db.writeFeedsToDatabase();
} catch(e) {
    console.error(e.message)
}
