const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendDueReminder } = require('../utils/mailer');

const startCronJobs = () => {
  // Runs every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running due-date reminder cron job...');
    try {
      const now   = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find all incomplete tasks due in the next 24 hours
      const tasks = await Task.find({
        dueDate: { $gte: now, $lte: in24h },
        status:  { $ne: 'done' }
      }).populate('user', 'name email');

      // Group by user
      const byUser = {};
      tasks.forEach(task => {
        const uid = task.user._id.toString();
        if (!byUser[uid]) byUser[uid] = { user: task.user, tasks: [] };
        byUser[uid].tasks.push(task);
      });

      // Send one email per user
      for (const { user, tasks } of Object.values(byUser)) {
        try {
          await sendDueReminder({ to: user.email, name: user.name, tasks });
          console.log(`📧 Reminder sent to ${user.email} (${tasks.length} tasks)`);
        } catch (err) {
          console.error(`Failed to send reminder to ${user.email}:`, err.message);
        }
      }

      console.log(`✅ Cron done — processed ${Object.keys(byUser).length} users`);
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });

  console.log('⏰ Cron jobs registered');
};

module.exports = { startCronJobs };
