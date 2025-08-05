import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

router.get("/login", (req, res) => {
  console.log('Starting OAuth login flow...');
  const authUrl = `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?${new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: 'http://localhost:3001/auth/callback',
    scope: 'https://graph.microsoft.com/Mail.Read offline_access',
    response_mode: 'query'
  }).toString()}`;

  console.log('Redirecting to Microsoft login:', authUrl);
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  console.log('Received callback from Microsoft');
  const code = req.query.code as string;
  if (!code) {
    console.error('No authorization code received');
    return res.status(400).send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'AUTH_ERROR', error: 'Missing authorization code' }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
          <p>Authentication failed: Missing authorization code</p>
        </body>
      </html>
    `);
  }

  console.log('Exchanging authorization code for tokens...');
  try {
    const tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3001/auth/callback',
      scope: 'https://graph.microsoft.com/Mail.Read offline_access'
    });

    console.log('Token request URL:', tokenUrl);
    console.log('Token request params:', params.toString());

    const tokenResponse = await axios.post<TokenResponse>(
      tokenUrl,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log('Token exchange successful');
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    console.log('Received tokens:', {
      access_token: access_token.substring(0, 10) + '...',
      refresh_token: refresh_token.substring(0, 10) + '...',
      expires_in
    });

    // Return HTML that sends tokens to the main window
    res.send(`
      <html>
        <body>
          <script>
            const tokens = ${JSON.stringify({ access_token, refresh_token, expires_in })};
            console.log('Sending tokens to main window');
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'AUTH_SUCCESS', 
                tokens: tokens
              }, '*');
              console.log('Tokens sent to main window');
            } else {
              console.error('No opener window found');
            }
            setTimeout(() => window.close(), 1000);
          </script>
          <p>Authentication successful! You can close this window.</p>
          <p>Returning to the main application...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth Token Exchange Failed:', error);
    try {
      // Try to extract response data if available
      const err = error as any;
      if (err.response?.data) {
        console.error('Response data:', err.response.data);
      }
    } catch {
      // Ignore any errors in error handling
    }
    
    res.status(500).send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'AUTH_ERROR', 
                error: 'OAuth token exchange failed' 
              }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
          <p>Authentication failed. Please try again.</p>
        </body>
      </html>
    `);
  }
});

export default router;
