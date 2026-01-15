/**
 * Google Apps Script pour envoyer des emails via Gmail
 * 
 * INSTRUCTIONS :
 * 1. Allez sur https://script.google.com
 * 2. Créez un nouveau projet
 * 3. Collez ce code
 * 4. Déployez comme "Web app"
 * 5. Copiez l'URL du déploiement et utilisez-la dans success.html
 */

function doPost(e) {
  // Ajouter les headers CORS pour permettre les requêtes depuis le navigateur
  const output = ContentService.createTextOutput();
  
  try {
    // Parser les données reçues
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else {
      throw new Error('No data received');
    }
    
    const { email, licenseKey, productName, productPrice, paymentId, userName, downloadUrl } = data;
    
    // Vérifier les champs requis
    if (!email || !licenseKey || !productName) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Format du prix
    const formattedPrice = productPrice ? `$${productPrice.toFixed(2)}` : 'N/A';
    
    // Lien de téléchargement (depuis les données ou propriétés du script)
    const finalDownloadUrl = downloadUrl || PropertiesService.getScriptProperties().getProperty('DOWNLOAD_URL') || '#';
    
    // Contenu HTML de l'email
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #000;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin: 30px 0;
        }
        .receipt-section {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .receipt-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .receipt-item:last-child {
            border-bottom: none;
        }
        .receipt-label {
            font-weight: 600;
            color: #666;
        }
        .receipt-value {
            color: #000;
            font-weight: 700;
        }
        .license-box {
            background: #000;
            color: #fff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .license-key {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #00ff00;
            word-break: break-all;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #000;
            color: #fff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Thank You for Your Purchase!</h1>
        </div>
        
        <div class="content">
            <p>Hello ${userName || email.split('@')[0]},</p>
            
            <p>Thank you for purchasing <strong>${productName}</strong>! Your license key has been generated and is ready to use.</p>
            
            <div class="receipt-section">
                <h2 style="margin-top: 0; color: #000;">Purchase Receipt</h2>
                <div class="receipt-item">
                    <span class="receipt-label">Product:</span>
                    <span class="receipt-value">${productName}</span>
                </div>
                <div class="receipt-item">
                    <span class="receipt-label">Amount Paid:</span>
                    <span class="receipt-value">${formattedPrice}</span>
                </div>
                <div class="receipt-item">
                    <span class="receipt-label">Payment ID:</span>
                    <span class="receipt-value" style="font-size: 12px;">${paymentId || 'N/A'}</span>
                </div>
                <div class="receipt-item">
                    <span class="receipt-label">Date:</span>
                    <span class="receipt-value">${new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
            </div>
            
            <div class="license-box">
                <h2 style="color: #fff; margin-top: 0;">Your License Key</h2>
                <div class="license-key">${licenseKey}</div>
                <p style="color: #ccc; font-size: 14px; margin-bottom: 0;">
                    Save this key! You'll need it to activate Raige Tweak.
                </p>
            </div>
            
            <div style="text-align: center;">
                <h3>What's Next?</h3>
                <div style="margin: 20px 0;">
                    <a href="${finalDownloadUrl}" class="button" style="display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600;">
                        📥 Download Raige Tweak
                    </a>
                </div>
                <ol style="text-align: left; max-width: 400px; margin: 0 auto;">
                    <li>Download Raige Tweak using the button above</li>
                    <li>Install the application</li>
                    <li>Enter your license key when prompted</li>
                    <li>Enjoy your optimized PC!</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p style="margin: 5px 0;">© 2025 Raige Tweak. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
    
    // Version texte de l'email
    const textBody = `
Thank You for Your Purchase!

Hello ${userName || email.split('@')[0]},

Thank you for purchasing ${productName}!

Purchase Receipt:
- Product: ${productName}
- Amount Paid: ${formattedPrice}
- Payment ID: ${paymentId || 'N/A'}
- Date: ${new Date().toLocaleString()}

Your License Key: ${licenseKey}

What's Next?
1. Download Raige Tweak from: ${finalDownloadUrl}
2. Install the application
3. Enter your license key when prompted
4. Enjoy your optimized PC!

© 2025 Raige Tweak. All rights reserved.
    `;
    
    // Envoyer l'email via Gmail
    GmailApp.sendEmail(
      email,
      `Purchase Receipt - ${productName}`,
      textBody,
      {
        htmlBody: htmlBody,
        from: Session.getActiveUser().getEmail(), // Utilise l'email du compte Google connecté
        name: 'Raige Tweak'
      }
    );
    
    // Retourner une réponse de succès avec headers CORS
    output.setContent(JSON.stringify({
      success: true,
      message: 'Email sent successfully'
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    // Retourner une réponse d'erreur avec headers CORS
    output.setContent(JSON.stringify({
      success: false,
      error: 'Failed to send email',
      message: error.toString()
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

// Fonction doGet pour gérer les requêtes GET (optionnel, pour test)
function doGet(e) {
  return ContentService.createTextOutput('Raige Tweak Email Service - Use POST method').setMimeType(ContentService.MimeType.TEXT);
}

