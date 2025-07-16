# Social Authentication Setup Guide

This guide explains how to set up social authentication providers for your application.

## Current Status

Currently, only **Credentials Provider** (username/password) is enabled. Social providers are disabled by default to prevent errors when environment variables are not configured.

## Available Providers

The application supports the following social authentication providers:

1. **Google OAuth**
2. **GitHub OAuth**
3. **Facebook OAuth**
4. **Azure AD**

## How to Enable Social Providers

### 1. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret

### 2. GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret

### 3. Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add Facebook Login product
4. Configure the OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook` (development)
5. Copy the App ID and App Secret

### 4. Azure AD

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Create a new registration
4. Configure redirect URIs:
   - `http://localhost:3000/api/auth/callback/azure-ad` (development)
5. Copy the Application (client) ID, Directory (tenant) ID, and create a client secret

## Environment Variables

Once you have the credentials, update your `.env.local` file:

```env
# Uncomment and fill in the values for the providers you want to use

# Google OAuth
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-actual-github-client-id
GITHUB_CLIENT_SECRET=your-actual-github-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-actual-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-actual-facebook-client-secret

# Azure AD
AZURE_AD_CLIENT_ID=your-actual-azure-client-id
AZURE_AD_CLIENT_SECRET=your-actual-azure-client-secret
AZURE_AD_TENANT_ID=your-actual-azure-tenant-id
```

## How It Works

The application automatically detects which providers are configured by checking if the environment variables are set and not equal to placeholder values. Only configured providers will appear in the sign-in page.

## Testing

1. Restart your development server after updating environment variables
2. Go to `/auth/signin`
3. You should see buttons for all configured providers
4. Test the authentication flow

## Troubleshooting

- **"client_id is required" error**: This means the environment variables are not properly set
- **Redirect URI mismatch**: Make sure the redirect URIs in your OAuth app match exactly
- **Provider not showing**: Check that the environment variables are uncommented and have valid values

## Security Notes

- Never commit your `.env.local` file to version control
- Use different OAuth apps for development and production
- Regularly rotate your client secrets
- Use HTTPS in production for all OAuth callbacks
