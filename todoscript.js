// Get references to DOM elements
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskTime = document.getElementById('task-time');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const filterIncomplete = document.getElementById('filter-incomplete');

// Set Minimum Date and Time
function setMinDateTime() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  taskDate.min = today;

  taskDate.addEventListener('change', () => {
    if (taskDate.value === today) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      taskTime.min = `${hours}:${minutes}`;
    } else {
      taskTime.min = '00:00';
    }
  });
}

// Load tasks from Local Storage
document.addEventListener('DOMContentLoaded', () => {
  setMinDateTime();
  loadTasks();
});

// Add Task
addBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  const date = taskDate.value;
  const time = taskTime.value;

  if (taskText === '') {
    alert('Please enter a task.');
    return;
  }

  if (!date || !time) {
    alert('Please select both date and time.');
    return;
  }

  const selectedDateTime = new Date(`${date}T${time}`);
  const now = new Date();

  if (selectedDateTime < now) {
    alert('You cannot select a past date or time.');
    return;
  }

  const task = {
    text: taskText,
    date: date,
    time: time,
    completed: false,
  };

  addTaskToDOM(task);
  saveTaskToLocalStorage(task);

  taskInput.value = '';
  taskDate.value = '';
  taskTime.value = '';
  setMinDateTime();
  updateFilter();
});

// Add Task to DOM
function addTaskToDOM(task) {
  const taskItem = document.createElement('li');
  taskItem.innerHTML = `
    <div>
      <strong>${task.text}</strong>
      <div class="task-meta">📅 ${task.date} 🕒 ${task.time}</div>
    </div>
    <button class="delete-btn">X</button>
  `;
  
  if (task.completed) {
    taskItem.classList.add('completed');
  }

  // Toggle task completion
  taskItem.addEventListener('click', () => {
    taskItem.classList.toggle('completed');
    updateTaskInLocalStorage(task.text);
    updateFilter();
  });

  // Delete task
  taskItem.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    taskItem.style.animation = 'fadeOut 0.5s forwards';
    setTimeout(() => {
      taskItem.remove();
      deleteTaskFromLocalStorage(task.text);
    }, 500);
  });

  taskList.appendChild(taskItem);
}

// Save Task to Local Storage
function saveTaskToLocalStorage(task) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update Task in Local Storage
function updateTaskInLocalStorage(taskText) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.map(task => {
    if (task.text === taskText) {
      task.completed = !task.completed;
    }
    return task;
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Delete Task from Local Storage
function deleteTaskFromLocalStorage(taskText) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.filter(task => task.text !== taskText);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load Tasks from Local Storage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => addTaskToDOM(task));
  updateFilter();
}

// Filter Incomplete Tasks
filterIncomplete.addEventListener('change', updateFilter);

function updateFilter() {
  const showIncompleteOnly = filterIncomplete.checked;
  const tasks = taskList.querySelectorAll('li');

  tasks.forEach(task => {
    if (showIncompleteOnly) {
      task.style.display = task.classList.contains('completed') ? 'none' : 'flex';
    } else {
      task.style.display = 'flex';
    }
  });
}
