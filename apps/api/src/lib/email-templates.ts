interface InvitationEmailData {
  appName: string;
  inviterName: string;
  inviteeIdentifier: string;
  customContent?: string;
  acceptUrl: string;
}

export function generateInvitationEmail(data: InvitationEmailData): string {
  const defaultContent = `You've been invited by ${data.inviterName} to join ${data.appName}!`;
  const content = data.customContent || defaultContent;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to ${data.appName}</title>
  <style>
    /* Reset styles */
    body, p, div, h1, h2, h3, h4, h5, h6 {
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      -webkit-font-smoothing: antialiased;
    }
    /* Container */
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: #ffffff;
    }
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      margin-bottom: 24px;
    }
    /* Content */
    .content {
      background-color: #f8fafc;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 32px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
      text-align: center;
    }
    .message {
      font-size: 16px;
      color: #4a5568;
      margin-bottom: 24px;
      text-align: center;
    }
    /* Button */
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background-color: #3182ce;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      font-size: 16px;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #2c5282;
    }
    /* Footer */
    .footer {
      text-align: center;
      font-size: 14px;
      color: #718096;
      margin-top: 32px;
    }
    /* Responsive */
    @media only screen and (max-width: 480px) {
      .container {
        padding: 20px 10px;
      }
      .content {
        padding: 24px 16px;
      }
      .title {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Join ${data.appName}</h1>
    </div>
    
    <div class="content">
      <p class="message">${content}</p>
      
      <div class="button-container">
        <a href="${data.acceptUrl}" class="button">Accept Invitation & Download App</a>
      </div>
      
      <p style="text-align: center; color: #718096; font-size: 14px;">
        or copy and paste this URL into your browser:<br>
        <a href="${data.acceptUrl}" style="color: #3182ce; word-break: break-all;">${data.acceptUrl}</a>
      </p>
    </div>
    
    <div class="footer">
      <p>This invitation was sent to ${data.inviteeIdentifier}</p>
      <p style="margin-top: 8px;">If you didn't expect this invitation, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
} 