/**
 * Transforme un token USER court (Graph API Explorer) en token de PAGE
 * permanent (qui n'expire pas).
 *
 * Pré-requis (.env) :
 *   FACEBOOK_APP_ID
 *   FACEBOOK_APP_SECRET
 *   FACEBOOK_PAGE_ID        (optionnel : pour filtrer sur votre page)
 *
 * Usage :
 *   pnpm tsx scripts/fb-longlived-token.ts <SHORT_LIVED_USER_TOKEN>
 *
 * ⚠️ Le token à passer est un token USER (« Get User Access Token »),
 *    pas un token de page.
 */
import "dotenv/config";

const GRAPH = "https://graph.facebook.com/v21.0";

type DebugInfo = { expires_at?: number; scopes?: string[]; type?: string };

const main = async () => {
  const shortToken = process.argv[2];
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const targetPageId = process.env.FACEBOOK_PAGE_ID;

  if (!shortToken) {
    throw new Error(
      "Usage : pnpm tsx scripts/fb-longlived-token.ts <SHORT_LIVED_USER_TOKEN>"
    );
  }
  if (!appId || !appSecret) {
    throw new Error("FACEBOOK_APP_ID et FACEBOOK_APP_SECRET requis dans .env.");
  }

  // 0. vérifie que le token fourni est bien un token USER
  const checkRes = await fetch(
    `${GRAPH}/debug_token?input_token=${shortToken}` +
      `&access_token=${appId}|${appSecret}`
  );
  const checkJson = await checkRes.json();
  const tokenType: string | undefined = checkJson?.data?.type;
  if (tokenType && tokenType !== "USER") {
    throw new Error(
      `Le token fourni est de type "${tokenType}", or il faut un token USER.\n` +
        `Dans le Graph API Explorer : « User or Page » → « Get User Access Token », ` +
        `puis relancez avec ce token.`
    );
  }

  // 1. token USER court -> token USER long (≈ 60 jours)
  const exchangeUrl =
    `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token` +
    `&client_id=${appId}&client_secret=${appSecret}` +
    `&fb_exchange_token=${shortToken}`;
  const exchangeRes = await fetch(exchangeUrl);
  const exchangeJson = await exchangeRes.json();
  if (!exchangeRes.ok || !exchangeJson.access_token) {
    throw new Error(`Échange échoué : ${JSON.stringify(exchangeJson)}`);
  }
  const longUserToken: string = exchangeJson.access_token;
  console.log("✅ Token USER longue durée obtenu.");

  // 2. token USER long -> token(s) de PAGE (permanents)
  const accountsRes = await fetch(
    `${GRAPH}/me/accounts?access_token=${longUserToken}`
  );
  const accountsJson = await accountsRes.json();
  if (!accountsRes.ok || !Array.isArray(accountsJson.data)) {
    throw new Error(`me/accounts échoué : ${JSON.stringify(accountsJson)}`);
  }

  const pages: Array<{ id: string; name: string; access_token: string }> =
    accountsJson.data;
  const page = targetPageId
    ? pages.find((p) => p.id === targetPageId)
    : pages[0];

  if (!page) {
    throw new Error(
      `Aucune page trouvée${targetPageId ? ` pour l'ID ${targetPageId}` : ""}. ` +
        `Pages disponibles : ${pages.map((p) => `${p.name} (${p.id})`).join(", ")}`
    );
  }

  // 3. vérifie l'expiration du token de page
  const debugRes = await fetch(
    `${GRAPH}/debug_token?input_token=${page.access_token}` +
      `&access_token=${appId}|${appSecret}`
  );
  const debugJson = await debugRes.json();
  const info: DebugInfo = debugJson.data ?? {};
  const expiresLabel =
    info.expires_at === 0 || info.expires_at === undefined
      ? "Jamais (permanent)"
      : new Date(info.expires_at * 1000).toISOString();

  console.log("\n========================================");
  console.log(`📄 Page    : ${page.name} (${page.id})`);
  console.log(`⏳ Expire  : ${expiresLabel}`);
  console.log(`Scopes     : ${(info.scopes ?? []).join(", ")}`);
  console.log("========================================\n");
  console.log("Ajoutez ceci dans .env :\n");
  console.log(`FACEBOOK_PAGE_ID=${page.id}`);
  console.log(`FACEBOOK_PAGE_ACCESS_TOKEN=${page.access_token}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
