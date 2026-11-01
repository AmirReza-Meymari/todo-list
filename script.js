
const STORAGE_KEY = "todo-list-tasks";

let tasks = loadTasks();      
let currentFilter = "all";    
let editingId = null;         

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("title-input");
const descriptionInput = document.getElementById("description-input");
const formError = document.getElementById("form-error");
const taskList = document.getElementById("task-list");
const stats = document.getElementById("stats");
const filterButtons = document.querySelectorAll(".filter-btn");

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(title, description) {
  tasks.unshift({
    id: Date.now().toString(),
    title: title,
    description: description,
    completed: false,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function updateTask(id, title, description) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.title = title;
    task.description = description;
    saveTasks();
  }
}

function deleteTask(id) {
  if (!confirm("آیا از حذف این وظیفه مطمئن هستید؟")) return;
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

function toPersianNumber(number) {
  return number.toLocaleString("fa-IR");
}

function renderStats() {
  const total = tasks.length;
  const remaining = tasks.filter((t) => !t.completed).length;
  stats.textContent =
    "کل وظایف: " + toPersianNumber(total) +
    " | باقی‌مانده: " + toPersianNumber(remaining);
}

function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-small " + className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function createTaskItem(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", "انجام‌شده");
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title; 
  content.appendChild(title);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description;
    content.appendChild(description);
  }

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.appendChild(
    createButton("ویرایش", "btn-secondary", () => {
      editingId = task.id;
      render();
    })
  );
  actions.appendChild(
    createButton("حذف", "btn-danger", () => deleteTask(task.id))
  );
  content.appendChild(actions);

  li.appendChild(checkbox);
  li.appendChild(content);
  return li;
}

function createEditItem(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const form = document.createElement("form");
  form.className = "edit-form task-content";
  form.noValidate = true;

  const titleField = document.createElement("input");
  titleField.type = "text";
  titleField.value = task.title;
  titleField.maxLength = 100;
  titleField.setAttribute("aria-label", "عنوان وظیفه");

  const descriptionField = document.createElement("textarea");
  descriptionField.rows = 2;
  descriptionField.value = task.description;
  descriptionField.maxLength = 300;
  descriptionField.setAttribute("aria-label", "توضیحات وظیفه");

  const error = document.createElement("p");
  error.className = "error";
  error.hidden = true;
  error.textContent = "عنوان وظیفه نمی‌تواند خالی باشد.";

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-small btn-primary";
  saveButton.textContent = "ذخیره";

  const cancelButton = createButton("انصراف", "btn-secondary", () => {
    editingId = null;
    render();
  });

  actions.appendChild(saveButton);
  actions.appendChild(cancelButton);

  form.appendChild(titleField);
  form.appendChild(descriptionField);
  form.appendChild(error);
  form.appendChild(actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newTitle = titleField.value.trim();
    if (newTitle === "") {
      error.hidden = false;
      titleField.focus();
      return;
    }
    updateTask(task.id, newTitle, descriptionField.value.trim());
    editingId = null;
    render();
  });

  li.appendChild(form);
  return li;
}

function createEmptyMessage() {
  const li = document.createElement("li");
  li.className = "empty-message";

  if (tasks.length === 0) {
    li.textContent = "هنوز وظیفه‌ای ثبت نشده است. اولین وظیفه‌ی خود را اضافه کنید!";
  } else if (currentFilter === "active") {
    li.textContent = "همه‌ی وظایف انجام شده‌اند. آفرین!";
  } else {
    li.textContent = "هنوز وظیفه‌ی انجام‌شده‌ای وجود ندارد.";
  }
  return li;
}

function render() {
  taskList.textContent = ""; 
  renderStats();

  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    taskList.appendChild(createEmptyMessage());
    return;
  }

  filteredTasks.forEach((task) => {
    const item = task.id === editingId ? createEditItem(task) : createTaskItem(task);
    taskList.appendChild(item);
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (title === "") {
    formError.textContent = "لطفاً عنوان وظیفه را وارد کنید.";
    formError.hidden = false;
    titleInput.focus();
    return;
  }

  formError.hidden = true;
  addTask(title, description);
  taskForm.reset();
  titleInput.focus();
});

titleInput.addEventListener("input", () => {
  formError.hidden = true;
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

render();