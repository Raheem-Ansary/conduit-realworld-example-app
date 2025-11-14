const normalizeLogging = (value, defaultValue) => {
  if (typeof value === "function") return value;
  if (value === undefined || value === null || value === "") return defaultValue;

  const normalized = String(value).toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "console") {
    return console.log;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return defaultValue;
};

/** @type {import('sequelize').Options} */
module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME || process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DEV_DB_DIALECT || "postgres",
    logging: normalizeLogging(process.env.DEV_DB_LOGGING, console.log),
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOSTNAME || process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.TEST_DB_DIALECT || "postgres",
    logging: normalizeLogging(process.env.TEST_DB_LOGGING, false),
  },
  production: {
    username: process.env.PROD_DB_USERNAME || process.env.DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.PROD_DB_NAME || process.env.DB_NAME,
    host: process.env.PROD_DB_HOSTNAME || process.env.DB_HOST || "db",
    dialect: process.env.PROD_DB_DIALECT || process.env.DB_DIALECT || "postgres",
    logging: normalizeLogging(
      process.env.PROD_DB_LOGGING || process.env.DB_LOGGING,
      false,
    ),
  },
};
