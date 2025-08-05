import axios from 'axios';
import dotenv from 'dotenv';
import * as querystring from 'querystring';

dotenv.config();

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI!;  // e.g., http://localhost:3000/auth/callback
const AUTHORITY = "https://login.microsoftonline.com/consumers";  // For Hotmail/Outlook.com users
const TOKEN_ENDPOINT = `${AUTHORITY}/oauth2/v2.0/token`;

export class AuthService {
  static getAuthUrl(): string {
    const params = querystring.stringify({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      response_mode: "query",
      scope: "https://graph.microsoft.com/Mail.Read email openid profile offline_access",
    });

    return `${AUTHORITY}/oauth2/v2.0/authorize?${params}`;
  }

  static async exchangeCodeForToken(code: string) {
    try {
      const data = querystring.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      });

      const response = await axios.post(TOKEN_ENDPOINT, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return response.data;
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      throw new Error("Failed to authenticate with Microsoft.");
    }
  }
}
