const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const app = express();

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const DATA_DIR = path.join(__dirname, 'data');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial todos
const DEFAULT_TODOS = [
  { id: 1, text: 'Order more coffee for the office', completed: false, createdAt: '2026-08-10T09:15:00Z' },
  { id: 2, text: 'Book meeting room for sprint planning', completed: true, createdAt: '2026-08-10T09:20:00Z' },
  { id: 3, text: 'Send onboarding pack to new starters', completed: false, createdAt: '2026-08-10T09:25:00Z' }
];

let todos = [];
let nextId = 4;

// Load todos from file
function loadTodos() {
  try {
    if (fs.existsSync(TODOS_FILE)) {
      const data = fs.readFileSync(TODOS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      todos = parsed.todos || [];
      nextId = parsed.nextId || 4;
      console.log(`Loaded ${todos.length} todos from persistent storage`);
    } else {
      todos = JSON.parse(JSON.stringify(DEFAULT_TODOS));
      nextId = 4;
      saveTodos();
      console.log('Initialized with default todos');
    }
  } catch (err) {
    console.error('Error loading todos:', err.message);
    todos = JSON.parse(JSON.stringify(DEFAULT_TODOS));
    nextId = 4;
  }
}

// Save todos to file
function saveTodos() {
  try {
    fs.writeFileSync(TODOS_FILE, JSON.stringify({ todos, nextId }, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving todos:', err.message);
  }
}

// Load todos on startup
loadTodos();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/todos', (req, res) => {
  const sorted = _.orderBy(todos, ['createdAt'], ['desc']);
  res.json(sorted);
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Text must be a string' });
  }

  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return res.status(400).json({ error: 'Text cannot be empty' });
  }

  if (trimmedText.length > 200) {
    return res.status(400).json({ error: 'Text must be 200 characters or fewer' });
  }

  const todo = {
    id: nextId++,
    text: trimmedText,
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(todo);
  saveTodos();
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todo.completed = !todo.completed;
  saveTodos();
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex((todo) => todo.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(index, 1);
  saveTodos();
  res.status(204).end();
});

app.get('/api/debug', (req, res) => {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    todoCount: todos.length
  });
});

app.post('/api/admin/reset', (req, res) => {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  todos = [];
  saveTodos();
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON'
    });
  }

  next(err);
});

app.listen(PORT, () => {
  console.log(`Taskboard running at http://localhost:${PORT}`);
});
