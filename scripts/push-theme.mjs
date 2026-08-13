// Push the packaged theme zip to the store as an unpublished theme:
// staged upload -> themeCreate -> poll until processed.
import { readFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const STORE = env.SHOPIFY_STORE;
const API = `https://${STORE}/admin/api/2025-07/graphql.json`;
const ZIP_PATH = join(root, "stag-theme.zip");
const THEME_NAME = process.argv[2] || "Stag (dev)";

async function getToken() {
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(json)}`);
  console.log("Token scopes:", json.scope);
  return json.access_token;
}

const token = await getToken();

async function gql(query, variables) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// 1. Staged upload target
const staged = await gql(
  `mutation($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`,
  {
    input: [
      {
        filename: basename(ZIP_PATH),
        mimeType: "application/zip",
        httpMethod: "POST",
        resource: "FILE",
      },
    ],
  }
);
const errs = staged.stagedUploadsCreate.userErrors;
if (errs.length) throw new Error("stagedUploadsCreate: " + JSON.stringify(errs));
const target = staged.stagedUploadsCreate.stagedTargets[0];
console.log("Staged target created.");

// 2. Upload the zip
const form = new FormData();
for (const p of target.parameters) form.append(p.name, p.value);
form.append("file", new Blob([readFileSync(ZIP_PATH)], { type: "application/zip" }), basename(ZIP_PATH));
const uploadRes = await fetch(target.url, { method: "POST", body: form });
if (!uploadRes.ok && uploadRes.status !== 201) {
  throw new Error(`Upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
}
console.log("Zip uploaded:", target.resourceUrl);

// 3. Create the theme from the staged URL
const created = await gql(
  `mutation($name: String!, $source: URL!) {
    themeCreate(name: $name, source: $source) {
      theme { id name role }
      userErrors { field message }
    }
  }`,
  { name: THEME_NAME, source: target.resourceUrl }
);
const cErrs = created.themeCreate.userErrors;
if (cErrs.length) throw new Error("themeCreate: " + JSON.stringify(cErrs));
const theme = created.themeCreate.theme;
console.log(`Theme created: ${theme.name} (${theme.id}) role=${theme.role}`);

// 4. Poll until processing completes
const themeIdNum = theme.id.split("/").pop();
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 2000));
  const d = await gql(`{ theme(id: "${theme.id}") { processing processingFailed } }`);
  if (d.theme.processingFailed) throw new Error("Theme processing FAILED");
  if (!d.theme.processing) {
    console.log("Processing complete.");
    break;
  }
  console.log("Processing...");
}

console.log(`Preview: https://${STORE}/?preview_theme_id=${themeIdNum}`);
console.log(`Editor:  https://${STORE}/admin/themes/${themeIdNum}/editor`);
