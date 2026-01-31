const Task = require('../models/Task');

// 1. Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTask = await Task.create({ title, description });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
};

// 2. Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// 3. Update Task (e.g., mark as completed)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title } = req.body;
    
    // Efficient update: only updates changed fields
    const [updated] = await Task.update(
      { status, title }, 
      { where: { id } }
    );

    if (updated) {
      const updatedTask = await Task.findByPk(id);
      res.status(200).json(updatedTask);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
};

// 4. Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.destroy({ where: { id } });
    
    if (deleted) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
};