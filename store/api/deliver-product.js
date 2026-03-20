// Product Delivery API
// Sends product via email after successful payment

const nodemailer = require('nodemailer');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const { email, product, paymentIntent } = JSON.parse(event.body);

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Product delivery config
    const products = {
      'chatgpt-mastery': {
        name: 'ChatGPT Mastery for Operators',
        downloadUrl: 'https://rustwood.au/downloads/chatgpt-mastery.pdf',
        notionUrl: 'https://rustwood.notion.site/chatgpt-mastery'
      }
    };

    const productInfo = products[product];

    if (!productInfo) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unknown product' })
      };
    }

    // Send delivery email
    await transporter.sendMail({
      from: '"Rustwood Store" <store@rustwood.au>',
      to: email,
      subject: `Your ${productInfo.name} is ready`,
      html: `
        <h2>Thanks for your purchase!</h2>
        <p>Your copy of <strong>${productInfo.name}</strong> is ready for download.</p>
        <p><a href="${productInfo.downloadUrl}" style="display: inline-block; padding: 12px 24px; background: #d4af37; color: #000; text-decoration: none; border-radius: 6px; font-weight: 600;">Download PDF</a></p>
        <p>Or access the <a href="${productInfo.notionUrl}">Notion version</a></p>
        <p style="color: #666; margin-top: 2rem;">Questions? Reply to this email.</p>
      `
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Delivery error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Delivery failed' })
    };
  }
};
