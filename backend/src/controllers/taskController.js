const Task = require('../models/Task');
const { encrypt, decrypt } = require('../utils/crypto');

const formatTask = (task) => {
  const t = task.toObject ? task.toObject() : { ...task };
  if (t.description) t.description = decrypt(t.description);
  return t;
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [statusCounts, priorityCounts, overdue] = await Promise.all([
      Task.aggregate([{ $match: { user: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: { user: userId } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments({ user: userId, dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
    ]);
    const total = statusCounts.reduce((sum, s) => sum + s.count, 0);
    const byStatus = { todo: 0, 'in-progress': 0, done: 0 };
    statusCounts.forEach(s => { byStatus[s._id] = s.count; });
    const byPriority = { low: 0, medium: 0, high: 0 };
    priorityCounts.forEach(p => { byPriority[p._id] = p.count; });
    res.status(200).json({ success: true, data: { total, byStatus, byPriority, overdue } });
  } catch (error) { next(error); }
};

const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 9, status, search, priority } = req.query;
    const query = { user: req.user._id };
    if (status && ['todo', 'in-progress', 'done'].includes(status)) query.status = status;
    if (priority && ['low', 'medium', 'high'].includes(priority)) query.priority = priority;
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escaped, $options: 'i' };
    }
    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 9));
    const skip = (pageNum - 1) * limitNum;
    const [tasks, total] = await Promise.all([
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(query)
    ]);
    res.status(200).json({
      success: true,
      data: tasks.map(formatTask),
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (error) { next(error); }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Task title is required.' });
    const task = await Task.create({
      title: title.trim(),
      description: description ? encrypt(description.trim()) : '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      user: req.user._id
    });
    res.status(201).json({ success: true, message: 'Task created.', data: formatTask(task) });
  } catch (error) { next(error); }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.status(200).json({ success: true, data: formatTask(task) });
  } catch (error) { next(error); }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const update = {};
    if (title       !== undefined) update.title       = title.trim();
    if (status      !== undefined) update.status      = status;
    if (priority    !== undefined) update.priority    = priority;
    if (dueDate     !== undefined) update.dueDate     = dueDate || null;
    if (description !== undefined) update.description = description ? encrypt(description.trim()) : '';
    if (Object.keys(update).length === 0) return res.status(400).json({ success: false, message: 'No fields to update.' });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.status(200).json({ success: true, message: 'Task updated.', data: formatTask(task) });
  } catch (error) { next(error); }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.status(200).json({ success: true, message: 'Task deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, getStats };
