const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendDueReminder = async ({ to, name, tasks }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return; // skip if not configured

  const transporter = createTransporter();

  const taskList = tasks.map(t =>
    `<li style="margin-bottom:8px;">
      <strong>${t.title}</strong>
      <span style="color:#64748b;font-size:13px;"> — due ${new Date(t.dueDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
     </li>`
  ).join('');

  await transporter.sendMail({
    from:    `"TaskFlow" <${process.env.SMTP_USER}>`,
    to,
    subject: `⏰ You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} due soon — TaskFlow`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f4f6fb;border-radius:16px;">
        <h1 style="color:#4f46e5;font-size:24px;margin-bottom:4px;">✅ TaskFlow</h1>
        <p style="color:#1e293b;font-size:16px;margin-bottom:20px;">Hi <strong>${name}</strong>, you have tasks due in the next 24 hours:</p>
        <ul style="background:#fff;border-radius:10px;padding:20px 28px;list-style:none;margin:0 0 20px;">
          ${taskList}
        </ul>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
           style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">
          Open TaskFlow →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">You're receiving this because you have an account on TaskFlow.</p>
      </div>
    `
  });
};

module.exports = { sendDueReminder };
