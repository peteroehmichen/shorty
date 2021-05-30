const { urlAlphabet } = require("nanoid");
const { customAlphabet } = require("nanoid/non-secure");
const getNewCode = customAlphabet(urlAlphabet, 5);

const { Client } = require("pg");
const connection = {
    connectionString: process.env.DATABASE_URL,
};
if (process.env.NODE_ENV === "production") {
    connection.ssl = {
        rejectUnauthorized: false,
    };
}
const sql = new Client(connection);
sql.connect();

console.log("DB:", process.env.DATABASE_URL);
module.exports.getAll = function () {
    return sql.query("SELECT * FROM urls ORDER BY last_updated DESC;");
};

module.exports.addCode = async function (url) {
    const { rows } = await sql.query(
        `SELECT original_url FROM urls WHERE original_url = '${url}';`
    );
    if (rows.length) {
        return sql.query(
            `UPDATE urls SET created_count = created_count + 1, last_updated = CURRENT_TIMESTAMP WHERE original_url ='${url}';`
        );
    }
    let repeat = true;
    do {
        const code = getNewCode();
        const result = await sql.query(
            `INSERT INTO urls (created_count, accessed_count, code, original_url) VALUES (1, 0, '${code}', '${url}') ON CONFLICT (code) DO NOTHING;`
        );
        repeat = result.rowCount > 0 ? false : true;
    } while (repeat);
    return;
};

module.exports.getURL = function (code) {
    return sql.query(
        `UPDATE urls SET accessed_count = accessed_count + 1 WHERE code ='${code}' RETURNING original_url;`
    );
};
