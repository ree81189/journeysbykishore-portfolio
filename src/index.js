const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.metadata.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/photos") {
      try {
        const photos = await getDrivePhotos(env);
        return new Response(JSON.stringify(photos), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            "cache-control": "public, max-age=60"
          }
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Unable to load Google Drive photos",
            message: error.message
          }),
          {
            status: 500,
            headers: {
              "content-type": "application/json;charset=UTF-8"
            }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};

async function getDrivePhotos(env) {
  const serviceAccount = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);

  const accessToken = await createAccessToken(serviceAccount);

  const folders = await listFiles(
    accessToken,
    `'${env.DRIVE_FOLDER_ID}' in parents and trashed = false`
  );

  const categories = [];

  for (const folder of folders.filter(
    item => item.mimeType === "application/vnd.google-apps.folder"
  )) {
    const files = await listFiles(
      accessToken,
      `'${folder.id}' in parents and trashed = false`
    );

    const photos = files
      .filter(item => item.mimeType && item.mimeType.startsWith("image/"))
      .map(item => ({
        id: item.id,
        name: item.name,
        category: folder.name,
        thumbnailUrl:
          `https://drive.google.com/thumbnail?id=${encodeURIComponent(item.id)}&sz=w2000`
      }));

    if (photos.length) {
      categories.push({
        name: folder.name,
        photos
      });
    }
  }

  return {
    categories,
    totalPhotos: categories.reduce(
      (total, category) => total + category.photos.length,
      0
    )
  };
}

async function listFiles(accessToken, query) {
  const results = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({
      q: query,
      fields:
        "nextPageToken,files(id,name,mimeType,modifiedTime)",
      pageSize: "1000"
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const response = await fetch(`${DRIVE_API}?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google Drive API error: ${response.status} ${text}`);
    }

    const data = await response.json();

    results.push(...(data.files || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return results;
}

async function createAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: DRIVE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = base64UrlEncode(
    JSON.stringify(header)
  );

  const encodedPayload = base64UrlEncode(
    JSON.stringify(payload)
  );

  const unsignedToken =
    `${encodedHeader}.${encodedPayload}`;

  const privateKey = await importPrivateKey(
    serviceAccount.private_key
  );

  const signature = await crypto.subtle.sign(
    {
      name: "RSASSA-PKCS1-v1_5"
    },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const assertion =
    `${unsignedToken}.${base64UrlEncode(signature)}`;

  const body = new URLSearchParams({
    grant_type:
      "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type":
        "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Google authentication error: ${response.status} ${text}`
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("Google did not return an access token.");
  }

  return data.access_token;
}

async function importPrivateKey(pem) {
  const cleaned = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binary = atob(cleaned);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
}

function base64UrlEncode(value) {
  let bytes;

  if (typeof value === "string") {
    bytes = new TextEncoder().encode(value);
  } else {
    bytes = new Uint8Array(value);
  }

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
