// Upsert specific files to the existing dev theme via themeFilesUpsert.
// Usage: node update-theme.mjs <file...>  (paths relative to theme/)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const THEME_ID = "gid://shopify/OnlineStoreTheme/160178307221";
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const STORE = env.SHOPIFY_STORE;
const API = `https://${STORE}/admin/api/2025-07/graphql.json`;

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node update-theme.mjs <file relative to theme/ ...>");
  process.exit(1);
}

const tokenRes = await fetch(`https://${STORE}/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grant_type: "client_credentials",
    client_id: env.SHOPIFY_CLIENT_ID,
    client_secret: env.SHOPIFY_CLIENT_SECRET,
  }),
});
const { access_token: token } = await tokenRes.json();
if (!token) throw new Error("Token exchange failed");

const isBinary = (f) => /\.(jpg|jpeg|png|gif|webp|svg|woff2?)$/i.test(f);

// themeFilesUpsert accepts at most 50 files per call; batch to stay under it.
for (let i = 0; i < files.length; i += 40) {
  const batch = files.slice(i, i + 40).map((f) => ({
    filename: f,
    body: isBinary(f)
      ? { type: "BASE64", value: readFileSync(join(root, "theme", f)).toString("base64") }
      : { type: "TEXT", value: readFileSync(join(root, "theme", f), "utf8") },
  }));

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({
      query: `mutation($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }`,
      variables: { themeId: THEME_ID, files: batch },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  const { upsertedThemeFiles, userErrors } = json.data.themeFilesUpsert;
  if (userErrors.length) {
    console.error("ERRORS:", JSON.stringify(userErrors, null, 2));
    process.exit(1);
  }
  for (const f of upsertedThemeFiles) console.log("Upserted:", f.filename);
}
console.log("Done.");
