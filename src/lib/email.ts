// Email confirmation templates and functions

export const emailTemplates = {
  welcome: {
    subject: 'Welcome to HydraSpace! 🎓',
    html: (name: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to HydraSpace</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f8fafc;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: white;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
            }
            .content {
              padding: 40px 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              background-color: #f8fafc;
              padding: 30px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <span style="font-size: 24px; font-weight: bold;">HS</span>
              </div>
              <h1 style="margin: 0; font-size: 28px;">Welcome to HydraSpace! 🎓</h1>
              <p style="margin: 10px 0 0; font-size: 18px;">Your digital academic workspace awaits</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name}! 👋</h2>
              <p>Thank you for joining HydraSpace! Your account has been successfully created and you're all set to organize your academic life.</p>
              
              <h3>What's Next? 🚀</h3>
              <ul style="line-height: 2;">
                <li><strong>Create Courses:</strong> Add your courses and organize them by semester</li>
                <li><strong>Take Notes:</strong> Use our structured note-taking for lectures, assignments, and concepts</li>
                <li><strong>Share Knowledge:</strong> Connect with peers and share study materials</li>
                <li><strong>Track Progress:</strong> Monitor your academic journey with our dashboard</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm" class="button">
                  Confirm Your Account
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>HydraSpace</strong> - Built for university students by university students</p>
              <p style="margin-top: 10px; font-size: 12px;">
                © ${new Date().getFullYear()} HydraSpace. Designed for NUST and beyond 🎓
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  },
  
  courseCreated: {
    subject: 'Course Created Successfully! 📚',
    html: (courseName: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Course Created - HydraSpace</title>
          <style>
            body { font-family: sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Course Created!</h1>
            </div>
            <div class="content">
              <h2>${courseName}</h2>
              <p>Your course has been successfully created! You can now start adding notes and organizing your academic materials.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                Go to Dashboard
              </a>
            </div>
            <div class="footer">
              <p>HydraSpace - Your Academic Partner 🎓</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export const sendEmail = async (to: string, template: keyof typeof emailTemplates, data: any) => {
  // This would integrate with your email service (Resend, SendGrid, etc.)
  // For now, we'll just log it
  console.log('Sending email:', { to, template, data })
  
  // TODO: Integrate with actual email service
  // const response = await emailService.send({
  //   to,
  //   subject: emailTemplates[template].subject,
  //   html: emailTemplates[template].html(data)
  // })
  
  return { success: true }
}
