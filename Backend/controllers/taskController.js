const Task = require('../models/Task');
const User = require('../models/User');
const { spawn } = require('child_process');
const path = require('path');
const createTask = async (req, res) => {
  const { title, description, dueDate, assignedUser } = req.body;

  if (!title || !description || !dueDate || !assignedUser) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const userExists = await User.findById(assignedUser);
    if (!userExists) {
      return res.status(404).json({ message: 'Assigned user not found.' });
    }

    const task = new Task({ title, description, dueDate, assignedUser });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error creating task.' });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().select('_id title');
    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error fetching task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    const { title, description, status, dueDate, assignedUser } = req.body;
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    task.assignedUser = assignedUser || task.assignedUser;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error updating task.' });
  }
};
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error deleting task.' });
  }
};
const getTaskReport = (req, res) => {
    const scriptPath = path.join(__dirname, '..', '..', 'python-reporter', 'reporter.py');
    const pythonProcess = spawn('python3', [scriptPath]);

    let reportData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
        reportData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script error: ${errorData}`);
            return res.status(500).send(`Error generating report.`);
        }
        res.header('Content-Type', 'text/plain').send(reportData);
    });
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskReport,
};
