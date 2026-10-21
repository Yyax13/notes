var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TaskweaverPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian11 = require("obsidian");

// src/engines/TodoEngine.ts
var import_obsidian = require("obsidian");
var TodoEngine = class {
  constructor(vault, metadataCache, settings) {
    this.todos = /* @__PURE__ */ new Map();
    this.onUpdateCallbacks = [];
    this.fileEventRef = null;
    this.debounceTimer = null;
    this.pendingFiles = /* @__PURE__ */ new Set();
    this.DEBOUNCE_MS = 150;
    this.vault = vault;
    this.metadataCache = metadataCache;
    this.settings = settings;
  }
  async initialize() {
    await this.scanAllFiles();
    this.setupFileWatcher();
  }
  destroy() {
    if (this.fileEventRef) {
      this.vault.offref(this.fileEventRef);
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
  setupFileWatcher() {
    this.fileEventRef = this.vault.on("modify", async (file) => {
      if (file instanceof import_obsidian.TFile && file.extension === "md") {
        this.queueFileUpdate(file.path);
      }
    });
    this.vault.on("delete", (file) => {
      if (file instanceof import_obsidian.TFile && file.extension === "md") {
        this.removeTodosFromFile(file.path);
        this.scheduleDebouncedUpdate();
      }
    });
    this.vault.on("create", async (file) => {
      if (file instanceof import_obsidian.TFile && file.extension === "md") {
        this.queueFileUpdate(file.path);
      }
    });
    this.vault.on("rename", async (file, oldPath) => {
      if (file instanceof import_obsidian.TFile && file.extension === "md") {
        this.removeTodosFromFile(oldPath);
        this.queueFileUpdate(file.path);
      }
    });
  }
  queueFileUpdate(filePath) {
    this.pendingFiles.add(filePath);
    this.scheduleDebouncedUpdate();
  }
  scheduleDebouncedUpdate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => this.processPendingUpdates(), this.DEBOUNCE_MS);
  }
  async processPendingUpdates() {
    const filesToProcess = Array.from(this.pendingFiles);
    this.pendingFiles.clear();
    for (const filePath of filesToProcess) {
      const file = this.vault.getAbstractFileByPath(filePath);
      if (file instanceof import_obsidian.TFile) {
        await this.scanFile(file);
      }
    }
    if (filesToProcess.length > 0) {
      this.notifyUpdate();
    }
  }
  async scanAllFiles() {
    const files = this.vault.getMarkdownFiles().filter((f) => !this.isExcluded(f.path));
    for (const file of files) {
      await this.scanFile(file);
    }
  }
  isExcluded(filePath) {
    const includeFolders = this.settings.includeFolders || [];
    if (includeFolders.length > 0) {
      const included = includeFolders.some((folder) => {
        const normalized = folder.endsWith("/") ? folder : folder + "/";
        return filePath.startsWith(normalized) || filePath.startsWith(folder);
      });
      if (!included)
        return true;
    }
    return (this.settings.excludeFolders || []).some((folder) => {
      const normalized = folder.endsWith("/") ? folder : folder + "/";
      return filePath.startsWith(normalized) || filePath.startsWith(folder);
    });
  }
  async scanFile(file) {
    var _a;
    this.removeTodosFromFile(file.path);
    const content = await this.vault.read(file);
    const lines = content.split("\n");
    const todoRegex = /^(\s*)[-*]\s+\[([ xX])\]\s+(.+)$/;
    const parentStack = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line)
        continue;
      const match = line.match(todoRegex);
      if (match && match[1] !== void 0 && match[2] && match[3]) {
        const indent = match[1].length;
        const indentLevel = Math.floor(indent / 2);
        const completed = match[2].toLowerCase() === "x";
        const text = match[3].trim();
        const id = this.generateId(file.path, i + 1, text);
        while (parentStack.length > 0) {
          const lastParent = parentStack[parentStack.length - 1];
          if (lastParent && lastParent.indent >= indent) {
            parentStack.pop();
          } else {
            break;
          }
        }
        const lastItem = parentStack[parentStack.length - 1];
        const parentId = lastItem ? lastItem.id : null;
        const dueDateMatch = text.match(/(?:📅|📆|due::?)(\d{4}-\d{2}-\d{2})/);
        const dueDate = dueDateMatch ? (_a = dueDateMatch[1]) != null ? _a : null : null;
        const tagMatches = text.match(/#[\w\-/]+/g);
        const tags = tagMatches ? tagMatches : [];
        const todo = {
          id,
          text,
          filePath: file.path,
          lineNumber: i + 1,
          completed,
          priority: this.getPriority(id),
          rawLine: line,
          pinned: this.isPinned(id),
          indentLevel,
          parentId,
          dueDate,
          tags
        };
        this.todos.set(id, todo);
        parentStack.push({ id, indent });
      }
    }
  }
  removeTodosFromFile(filePath) {
    for (const [id, todo] of this.todos) {
      if (todo.filePath === filePath) {
        this.todos.delete(id);
      }
    }
  }
  generateId(filePath, lineNumber, _text) {
    return `${filePath}:${lineNumber}`;
  }
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  getPriority(id) {
    const index = this.settings.priorityOrder.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  }
  // Public API
  getTodos(respectFilters = true) {
    let todos = Array.from(this.todos.values());
    if (respectFilters && this.settings.hideCompleted) {
      todos = todos.filter((t) => !t.completed);
    }
    const tagFilters = this.settings.tagFilters || [];
    if (respectFilters && tagFilters.length > 0) {
      todos = todos.filter(
        (todo) => tagFilters.some((tag) => todo.text.includes(tag))
      );
    }
    return todos.sort((a, b) => {
      if (a.pinned && !b.pinned)
        return -1;
      if (!a.pinned && b.pinned)
        return 1;
      return a.priority - b.priority;
    });
  }
  getAllTodos() {
    return this.getTodos(false);
  }
  // Sub-task methods
  getSubTasks(todoId) {
    return Array.from(this.todos.values()).filter((t) => t.parentId === todoId).sort((a, b) => a.lineNumber - b.lineNumber);
  }
  getRootTodos() {
    return this.getTodos().filter((t) => t.parentId === null);
  }
  hasSubTasks(todoId) {
    return Array.from(this.todos.values()).some((t) => t.parentId === todoId);
  }
  getSubTaskProgress(todoId) {
    const subTasks = this.getSubTasks(todoId);
    return {
      completed: subTasks.filter((t) => t.completed).length,
      total: subTasks.length
    };
  }
  findDuplicates() {
    const textMap = /* @__PURE__ */ new Map();
    for (const todo of this.todos.values()) {
      const key = todo.text.toLowerCase().trim();
      if (!textMap.has(key)) {
        textMap.set(key, []);
      }
      textMap.get(key).push(todo);
    }
    const duplicates = /* @__PURE__ */ new Map();
    for (const [key, todos] of textMap) {
      if (todos.length > 1) {
        duplicates.set(key, todos);
      }
    }
    return duplicates;
  }
  getDuplicateIds() {
    const duplicates = this.findDuplicates();
    const ids = /* @__PURE__ */ new Set();
    for (const todos of duplicates.values()) {
      for (const todo of todos) {
        ids.add(todo.id);
      }
    }
    return ids;
  }
  updatePriorities(orderedIds) {
    this.settings.priorityOrder = orderedIds;
    for (const [id, todo] of this.todos) {
      todo.priority = this.getPriority(id);
    }
  }
  isPinned(todoId) {
    return (this.settings.pinnedIds || []).includes(todoId);
  }
  togglePin(todoId) {
    if (!this.settings.pinnedIds) {
      this.settings.pinnedIds = [];
    }
    const index = this.settings.pinnedIds.indexOf(todoId);
    if (index === -1) {
      this.settings.pinnedIds.push(todoId);
    } else {
      this.settings.pinnedIds.splice(index, 1);
    }
    const todo = this.todos.get(todoId);
    if (todo) {
      todo.pinned = this.isPinned(todoId);
    }
    this.notifyUpdate();
  }
  // Global priority (for List View mode)
  getGlobalPriority(todoId) {
    return (this.settings.priorities || {})[todoId] || 0;
  }
  setGlobalPriority(todoId, priority) {
    if (!this.settings.priorities) {
      this.settings.priorities = {};
    }
    if (priority === 0) {
      delete this.settings.priorities[todoId];
    } else {
      this.settings.priorities[todoId] = priority;
    }
    this.notifyUpdate();
  }
  // Global archive (for List View mode)
  isArchived(todoId) {
    return (this.settings.archivedIds || []).includes(todoId);
  }
  toggleArchive(todoId) {
    if (!this.settings.archivedIds) {
      this.settings.archivedIds = [];
    }
    const index = this.settings.archivedIds.indexOf(todoId);
    if (index === -1) {
      this.settings.archivedIds.push(todoId);
    } else {
      this.settings.archivedIds.splice(index, 1);
    }
    this.notifyUpdate();
  }
  getArchivedTodos() {
    const archivedIds = this.settings.archivedIds || [];
    return Array.from(this.todos.values()).filter((t) => archivedIds.includes(t.id));
  }
  async moveTodoToFile(todoId, targetFilePath) {
    const todo = this.todos.get(todoId);
    if (!todo)
      return false;
    const sourceFile = this.vault.getAbstractFileByPath(todo.filePath);
    const targetFile = this.vault.getAbstractFileByPath(targetFilePath);
    if (!(sourceFile instanceof import_obsidian.TFile) || !(targetFile instanceof import_obsidian.TFile)) {
      return false;
    }
    const sourceContent = await this.vault.read(sourceFile);
    const sourceLines = sourceContent.split("\n");
    sourceLines.splice(todo.lineNumber - 1, 1);
    await this.vault.modify(sourceFile, sourceLines.join("\n"));
    const targetContent = await this.vault.read(targetFile);
    const newContent = targetContent + "\n" + todo.rawLine;
    await this.vault.modify(targetFile, newContent);
    return true;
  }
  async toggleTodo(todoId) {
    const todo = this.todos.get(todoId);
    if (!todo)
      return false;
    const file = this.vault.getAbstractFileByPath(todo.filePath);
    if (!(file instanceof import_obsidian.TFile))
      return false;
    const content = await this.vault.read(file);
    const lines = content.split("\n");
    const line = lines[todo.lineNumber - 1];
    if (!line)
      return false;
    const newLine = todo.completed ? line.replace(/\[x\]/i, "[ ]") : line.replace(/\[ \]/, "[x]");
    lines[todo.lineNumber - 1] = newLine;
    await this.vault.modify(file, lines.join("\n"));
    return true;
  }
  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
  }
  notifyUpdate() {
    const todos = this.getTodos();
    for (const callback of this.onUpdateCallbacks) {
      callback(todos);
    }
  }
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.getTodos().filter(
      (todo) => todo.text.toLowerCase().includes(lowerQuery) || todo.filePath.toLowerCase().includes(lowerQuery)
    );
  }
};

// src/views/TodoView.ts
var import_obsidian4 = require("obsidian");

// src/modals/EditTaskModal.ts
var import_obsidian3 = require("obsidian");

// src/modals/DatePickerModal.ts
var import_obsidian2 = require("obsidian");
var DatePickerModal = class extends import_obsidian2.Modal {
  constructor(app, initialDate, onSelect) {
    super(app);
    this.selectedDate = initialDate;
    this.currentViewDate = initialDate ? new Date(initialDate) : /* @__PURE__ */ new Date();
    this.onSelect = onSelect;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("taskweaver-date-picker");
    this.render();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    const header = contentEl.createDiv({ cls: "taskweaver-dp-header" });
    header.createEl("h3", { text: "Select due date" });
    const main = contentEl.createDiv({ cls: "taskweaver-dp-main" });
    const leftPanel = main.createDiv({ cls: "taskweaver-dp-quick" });
    this.renderQuickOptions(leftPanel);
    const rightPanel = main.createDiv({ cls: "taskweaver-dp-calendar" });
    this.renderCalendar(rightPanel);
    const footer = contentEl.createDiv({ cls: "taskweaver-dp-footer" });
    const clearBtn = footer.createEl("button", { text: "Clear", cls: "taskweaver-btn-secondary" });
    clearBtn.addEventListener("click", () => {
      this.onSelect(null);
      this.close();
    });
    const confirmBtn = footer.createEl("button", { text: "Confirm", cls: "taskweaver-btn-primary" });
    confirmBtn.addEventListener("click", () => {
      this.onSelect(this.selectedDate);
      this.close();
    });
  }
  renderQuickOptions(container) {
    const options = [
      { label: "Today", days: 0 },
      { label: "Tomorrow", days: 1 },
      { label: "In 2 days", days: 2 },
      { label: "In 3 days", days: 3 },
      { label: "Next week", days: 7 },
      { label: "In 2 weeks", days: 14 },
      { label: "Next month", days: 30 }
    ];
    options.forEach((opt) => {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() + opt.days);
      const dateStr = this.formatDateString(date);
      const item = container.createDiv({ cls: "taskweaver-dp-quick-item" });
      if (this.selectedDate === dateStr) {
        item.addClass("is-selected");
      }
      const label = item.createSpan({ cls: "taskweaver-dp-quick-label" });
      label.setText(opt.label);
      const dateEl = item.createSpan({ cls: "taskweaver-dp-quick-date" });
      dateEl.setText(dateStr);
      item.addEventListener("click", () => {
        this.selectedDate = dateStr;
        this.render();
      });
    });
  }
  renderCalendar(container) {
    const nav = container.createDiv({ cls: "taskweaver-dp-nav" });
    const prevBtn = nav.createDiv({ cls: "taskweaver-dp-nav-btn" });
    (0, import_obsidian2.setIcon)(prevBtn, "chevron-left");
    prevBtn.addEventListener("click", () => {
      this.currentViewDate.setMonth(this.currentViewDate.getMonth() - 1);
      this.render();
    });
    const monthYear = nav.createDiv({ cls: "taskweaver-dp-month-year" });
    monthYear.setText(this.currentViewDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    }));
    const nextBtn = nav.createDiv({ cls: "taskweaver-dp-nav-btn" });
    (0, import_obsidian2.setIcon)(nextBtn, "chevron-right");
    nextBtn.addEventListener("click", () => {
      this.currentViewDate.setMonth(this.currentViewDate.getMonth() + 1);
      this.render();
    });
    const grid = container.createDiv({ cls: "taskweaver-dp-grid" });
    const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    dayHeaders.forEach((day) => {
      grid.createDiv({ cls: "taskweaver-dp-day-header", text: day });
    });
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      const dayEl = grid.createDiv({ cls: "taskweaver-dp-day other-month" });
      dayEl.setText(String(prevMonthLast - i));
    }
    const today = this.formatDateString(/* @__PURE__ */ new Date());
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDateString(date);
      const dayEl = grid.createDiv({ cls: "taskweaver-dp-day" });
      dayEl.setText(String(day));
      if (dateStr === today) {
        dayEl.addClass("is-today");
      }
      if (dateStr === this.selectedDate) {
        dayEl.addClass("is-selected");
      }
      dayEl.addEventListener("click", () => {
        this.selectedDate = dateStr;
        this.render();
      });
    }
    const endPadding = 7 - (startPadding + lastDay.getDate()) % 7;
    if (endPadding < 7) {
      for (let i = 1; i <= endPadding; i++) {
        const dayEl = grid.createDiv({ cls: "taskweaver-dp-day other-month" });
        dayEl.setText(String(i));
      }
    }
  }
  formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/EditTaskModal.ts
var EditTaskModal = class extends import_obsidian3.Modal {
  // Local state for checkbox
  constructor(app, todoEngine, todo, onTaskUpdated) {
    super(app);
    this.dueDate = "";
    this.tags = [];
    this.todoEngine = todoEngine;
    this.todo = todo;
    this.onTaskUpdated = onTaskUpdated;
    this.taskText = this.parseTaskText(todo.text);
    this.dueDate = this.parseDueDate(todo.text);
    this.tags = this.parseTags(todo.text);
    this.completedState = todo.completed;
  }
  parseTaskText(text) {
    return text.replace(/📅\s*\d{4}-\d{2}-\d{2}/g, "").replace(/[⏫🔼🔽]/g, "").replace(/#\w+/g, "").trim();
  }
  parseDueDate(text) {
    var _a;
    const match = text.match(/📅\s*(\d{4}-\d{2}-\d{2})/);
    return (_a = match == null ? void 0 : match[1]) != null ? _a : "";
  }
  parseTags(text) {
    const matches = text.match(/#\w+/g);
    return matches || [];
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("taskweaver-edit-modal");
    const header = contentEl.createDiv("taskweaver-modal-header");
    new import_obsidian3.Setting(header).setName("Edit task").setHeading();
    const main = contentEl.createDiv("taskweaver-modal-body");
    const taskSection = main.createDiv("taskweaver-field-group full-width");
    taskSection.createEl("label", { text: "Description" });
    const textArea = taskSection.createEl("textarea", { cls: "taskweaver-task-textarea" });
    textArea.value = this.taskText;
    textArea.placeholder = "What needs to be done?";
    textArea.rows = 4;
    textArea.addEventListener("input", (e) => {
      this.taskText = e.target.value;
    });
    const metaGrid = main.createDiv("taskweaver-meta-grid");
    const dateSection = metaGrid.createDiv("taskweaver-field-group");
    dateSection.createEl("label", { text: "Due date" });
    const dateWrapper = dateSection.createDiv({ cls: "taskweaver-date-wrapper" });
    const dateDisplay = dateWrapper.createSpan({ cls: "taskweaver-date-display" });
    dateDisplay.setText(this.dueDate || "No date");
    const dateBtn = dateWrapper.createEl("button", { text: "\u{1F4C5}", cls: "taskweaver-date-btn" });
    dateBtn.addEventListener("click", () => {
      new DatePickerModal(this.app, this.dueDate || null, (date) => {
        this.dueDate = date || "";
        dateDisplay.setText(this.dueDate || "No date");
        if (this.dueDate) {
          dateDisplay.addClass("has-date");
        } else {
          dateDisplay.removeClass("has-date");
        }
      }).open();
    });
    if (this.dueDate) {
      dateDisplay.addClass("has-date");
    }
    const statusSection = metaGrid.createDiv("taskweaver-field-group");
    statusSection.createEl("label", { text: "Status" });
    const statusRow = statusSection.createDiv({ cls: "taskweaver-status-row" });
    const statusCheckbox = statusRow.createEl("input", { type: "checkbox" });
    statusCheckbox.checked = this.completedState;
    statusRow.createSpan({ text: this.completedState ? "Completed" : "Pending", cls: "taskweaver-status-text" });
    statusCheckbox.addEventListener("change", () => {
      this.completedState = statusCheckbox.checked;
      const statusText = statusRow.querySelector(".taskweaver-status-text");
      if (statusText) {
        statusText.textContent = this.completedState ? "Completed" : "Pending";
      }
    });
    const tagSection = main.createDiv("taskweaver-field-group");
    tagSection.createEl("label", { text: "Tags" });
    const tagContainer = tagSection.createDiv("taskweaver-tags-edit");
    const renderTags = () => {
      tagContainer.empty();
      const tagsDisplay = tagContainer.createDiv("taskweaver-tags-list");
      this.tags.forEach((tag, index) => {
        const tagEl = tagsDisplay.createDiv({ cls: "taskweaver-tag-editable" });
        tagEl.createSpan({ text: tag });
        const removeBtn = tagEl.createSpan({ text: "\xD7", cls: "taskweaver-tag-remove" });
        removeBtn.addEventListener("click", () => {
          this.tags.splice(index, 1);
          renderTags();
        });
      });
      const addTagRow = tagContainer.createDiv("taskweaver-tag-add-row");
      const tagInput = addTagRow.createEl("input", {
        type: "text",
        placeholder: "#new-tag",
        cls: "taskweaver-tag-input"
      });
      const addBtn = addTagRow.createEl("button", { text: "+", cls: "taskweaver-tag-add-btn" });
      const addTag = () => {
        let newTag = tagInput.value.trim();
        if (!newTag)
          return;
        if (!newTag.startsWith("#"))
          newTag = "#" + newTag;
        if (!this.tags.includes(newTag)) {
          this.tags.push(newTag);
          renderTags();
        }
      };
      addBtn.addEventListener("click", addTag);
      tagInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addTag();
        }
      });
    };
    renderTags();
    const footerInfo = contentEl.createDiv("taskweaver-modal-info");
    footerInfo.createSpan({ text: `${this.todo.filePath}:${this.todo.lineNumber}`, cls: "taskweaver-monospace" });
    const actions = contentEl.createDiv("taskweaver-modal-actions");
    const deleteBtn = actions.createEl("button", { text: "Delete", cls: "mod-warning" });
    deleteBtn.addEventListener("click", () => this.confirmDelete());
    const spacer = actions.createDiv({ cls: "taskweaver-spacer" });
    const cancelBtn = actions.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = actions.createEl("button", { text: "Save", cls: "mod-cta" });
    saveBtn.addEventListener("click", () => this.submit());
  }
  async submit() {
    if (!this.taskText.trim()) {
      new import_obsidian3.Notice("Task text cannot be empty");
      return;
    }
    let newTaskLine = this.taskText.trim();
    if (this.tags.length > 0) {
      newTaskLine += " " + this.tags.join(" ");
    }
    if (this.dueDate) {
      newTaskLine += ` \u{1F4C5} ${this.dueDate}`;
    }
    try {
      const file = this.app.vault.getAbstractFileByPath(this.todo.filePath);
      if (file) {
        const content = await this.app.vault.read(file);
        const lines = content.split("\n");
        const lineIndex = this.todo.lineNumber - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const checkbox = this.completedState ? "- [x]" : "- [ ]";
          lines[lineIndex] = `${checkbox} ${newTaskLine}`;
          await this.app.vault.modify(file, lines.join("\n"));
          new import_obsidian3.Notice("Task updated");
          this.close();
          try {
            this.onTaskUpdated();
          } catch (e) {
            console.error("Error updating task view:", e);
          }
        }
      }
    } catch (error) {
      new import_obsidian3.Notice("Failed to update task: " + error);
    }
  }
  async confirmDelete() {
    if (!confirm("Delete this task permanently?")) {
      return;
    }
    try {
      const file = this.app.vault.getAbstractFileByPath(this.todo.filePath);
      if (file) {
        const content = await this.app.vault.read(file);
        const lines = content.split("\n");
        const lineIndex = this.todo.lineNumber - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          lines.splice(lineIndex, 1);
          await this.app.vault.modify(file, lines.join("\n"));
          new import_obsidian3.Notice("Task deleted");
          this.close();
          try {
            this.onTaskUpdated();
          } catch (e) {
            console.error("Error updating task view:", e);
          }
        }
      }
    } catch (error) {
      new import_obsidian3.Notice("Failed to delete task: " + error);
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/views/TodoView.ts
var VIEW_TYPE_TODO = "taskweaver-view";
var TodoView = class extends import_obsidian4.ItemView {
  constructor(leaf, engine, onSettingsChange, boardEngine) {
    super(leaf);
    this.boardEngine = null;
    this.currentFilter = "";
    this.duplicateIds = /* @__PURE__ */ new Set();
    this.draggedItem = null;
    this.draggedTodoId = null;
    this.viewMode = "list";
    this.engine = engine;
    this.onSettingsChange = onSettingsChange;
    this.boardEngine = boardEngine || null;
  }
  getViewType() {
    return VIEW_TYPE_TODO;
  }
  getDisplayText() {
    return "Todo list";
  }
  getIcon() {
    return "check-square";
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("taskweaver-container");
    const header = contentEl.createDiv({ cls: "taskweaver-header" });
    this.renderViewModeSelector(header);
    this.searchInput = header.createEl("input", {
      type: "text",
      placeholder: "Search todos...",
      cls: "taskweaver-search"
    });
    this.searchInput.addEventListener("input", () => {
      this.currentFilter = this.searchInput.value;
      this.renderList();
    });
    const statsBar = contentEl.createDiv({ cls: "taskweaver-stats" });
    this.updateStats(statsBar);
    this.listEl = contentEl.createDiv({ cls: "taskweaver-list" });
    this.duplicateIds = this.engine.getDuplicateIds();
    this.renderList();
    this.engine.onUpdate(() => {
      this.duplicateIds = this.engine.getDuplicateIds();
      this.renderList();
    });
    if (this.boardEngine) {
      this.boardEngine.onUpdate(() => this.renderList());
    }
  }
  renderViewModeSelector(container) {
    const selectorWrap = container.createDiv({ cls: "taskweaver-view-selector" });
    const select = selectorWrap.createEl("select", { cls: "taskweaver-view-select" });
    const listOption = select.createEl("option", { text: "List view", value: "list" });
    if (this.viewMode === "list")
      listOption.selected = true;
    if (this.boardEngine) {
      const boards = this.boardEngine.getAllBoards();
      for (const board of boards) {
        const option = select.createEl("option", {
          text: board.name,
          value: board.id
        });
        if (this.viewMode === board.id)
          option.selected = true;
      }
    }
    select.addEventListener("change", () => {
      this.viewMode = select.value;
      this.renderList();
    });
  }
  updateStats(container) {
    const todos = this.engine.getTodos();
    const completed = todos.filter((t) => t.completed).length;
    const duplicates = this.engine.getDuplicateIds().size;
    container.empty();
    container.createSpan({ text: `${todos.length} todos`, cls: "taskweaver-stat" });
    container.createSpan({ text: `${completed} done`, cls: "taskweaver-stat taskweaver-stat-done" });
    if (duplicates > 0) {
      container.createSpan({ text: `${duplicates} duplicates`, cls: "taskweaver-stat taskweaver-stat-dup" });
    }
  }
  renderList() {
    this.listEl.empty();
    const statsBar = this.contentEl.querySelector(".taskweaver-stats");
    if (statsBar)
      this.updateStats(statsBar);
    if (this.viewMode === "list") {
      this.renderFlatList();
    } else {
      this.renderBoardGroupedList();
    }
  }
  renderFlatList() {
    let todos = this.currentFilter ? this.engine.search(this.currentFilter) : this.engine.getTodos();
    if (todos.length === 0) {
      this.listEl.createDiv({
        text: this.currentFilter ? "No matching todos" : "No todos found",
        cls: "taskweaver-empty"
      });
      return;
    }
    for (const todo of todos) {
      this.renderTodoItem(todo, this.listEl);
    }
  }
  renderBoardGroupedList() {
    if (!this.boardEngine) {
      this.listEl.createDiv({ text: "No board engine", cls: "taskweaver-empty" });
      return;
    }
    const board = this.boardEngine.getBoard(this.viewMode);
    if (!board) {
      this.listEl.createDiv({ text: "Board not found", cls: "taskweaver-empty" });
      return;
    }
    for (const column of board.columns) {
      this.renderColumnGroup(board, column);
    }
  }
  renderColumnGroup(board, column) {
    const groupEl = this.listEl.createDiv({ cls: "taskweaver-group" });
    const headerEl = groupEl.createDiv({ cls: "taskweaver-group-header" });
    headerEl.createSpan({ text: column.name, cls: "taskweaver-group-title" });
    const todosEl = groupEl.createDiv({ cls: "taskweaver-group-todos" });
    todosEl.setAttribute("data-column-id", column.id);
    todosEl.setAttribute("data-board-id", board.id);
    todosEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer)
        e.dataTransfer.dropEffect = "move";
      todosEl.addClass("drag-over");
    });
    todosEl.addEventListener("dragleave", () => {
      todosEl.removeClass("drag-over");
    });
    todosEl.addEventListener("drop", (e) => {
      e.preventDefault();
      todosEl.removeClass("drag-over");
      if (this.draggedTodoId && this.boardEngine) {
        this.boardEngine.assignTodoToColumn(board.id, this.draggedTodoId, column.id);
        this.onSettingsChange();
      }
    });
    const todos = this.boardEngine.getTodosForColumn(board.id, column.id);
    const filteredTodos = this.currentFilter ? todos.filter((t) => t.text.toLowerCase().includes(this.currentFilter.toLowerCase())) : todos;
    headerEl.createSpan({ text: ` (${filteredTodos.length})`, cls: "taskweaver-group-count" });
    for (const todo of filteredTodos) {
      this.renderTodoItem(todo, todosEl, board);
    }
  }
  renderTodoItem(todo, container, board) {
    var _a;
    const item = container.createDiv({ cls: "taskweaver-item" });
    item.setAttribute("data-id", todo.id);
    item.setAttribute("draggable", "true");
    if (todo.completed) {
      item.addClass("is-completed");
    }
    if (this.duplicateIds.has(todo.id)) {
      item.addClass("is-duplicate");
    }
    if (board && this.boardEngine) {
      const priority = this.boardEngine.getTodoPriority(board.id, todo.id);
      if (priority === 1) {
        item.addClass("priority-high");
      } else if (priority === 2) {
        item.addClass("priority-medium");
      } else if (priority === 3) {
        item.addClass("priority-low");
      }
    } else {
      const priority = this.engine.getGlobalPriority(todo.id);
      if (priority === 1) {
        item.addClass("priority-high");
      } else if (priority === 2) {
        item.addClass("priority-medium");
      } else if (priority === 3) {
        item.addClass("priority-low");
      }
    }
    const isPinned = board ? (_a = this.boardEngine) == null ? void 0 : _a.isBoardPinned(board.id, todo.id) : todo.pinned;
    if (isPinned) {
      item.addClass("is-pinned");
    }
    const handle = item.createDiv({ cls: "taskweaver-drag-handle" });
    (0, import_obsidian4.setIcon)(handle, isPinned ? "pin" : "grip-vertical");
    const checkbox = item.createEl("input", { type: "checkbox", cls: "taskweaver-checkbox" });
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      void this.engine.toggleTodo(todo.id);
    });
    const cleanText = todo.text.replace(/(?:📅|📆|due::?)\d{4}-\d{2}-\d{2}/g, "").replace(/#[\w\-/]+/g, "").trim();
    const text = item.createDiv({ cls: "taskweaver-text" });
    text.setText(cleanText || todo.text);
    const meta = item.createDiv({ cls: "taskweaver-item-meta" });
    if (todo.dueDate) {
      const dateClass = this.getDateStatusClass(todo.dueDate);
      const dateBadge = meta.createSpan({ cls: `taskweaver-date-badge ${dateClass}` });
      dateBadge.setText(this.formatDateRelative(todo.dueDate));
    }
    if (todo.tags && todo.tags.length > 0) {
      for (const tag of todo.tags.slice(0, 3)) {
        const tagEl = meta.createSpan({ cls: "taskweaver-item-tag" });
        tagEl.setText(tag);
      }
      if (todo.tags.length > 3) {
        const moreEl = meta.createSpan({ cls: "taskweaver-item-tag-more" });
        moreEl.setText(`+${todo.tags.length - 3}`);
      }
    }
    if (this.engine.hasSubTasks(todo.id)) {
      const progress = this.engine.getSubTaskProgress(todo.id);
      const subTasksSection = item.createDiv({ cls: "taskweaver-subtasks-section" });
      const toggleHeader = subTasksSection.createDiv({ cls: "taskweaver-subtasks-toggle" });
      const expandIcon = toggleHeader.createSpan({ cls: "taskweaver-subtasks-icon", text: "\u25B6" });
      const progressText = toggleHeader.createSpan({ cls: "taskweaver-subtasks-progress" });
      const percent = Math.round(progress.completed / progress.total * 100);
      const progressBar = progressText.createSpan({ cls: "taskweaver-progress-bar" });
      const progressFill = progressBar.createSpan();
      progressFill.style.width = `${percent}%`;
      progressText.createSpan({ text: ` ${progress.completed}/${progress.total}` });
      const subTasksList = subTasksSection.createDiv({ cls: "taskweaver-subtasks-list is-collapsed" });
      const subTasks = this.engine.getSubTasks(todo.id);
      for (const subTask of subTasks) {
        const subItem = subTasksList.createDiv({ cls: "taskweaver-subtask-item" });
        const checkbox2 = subItem.createEl("input", { type: "checkbox" });
        checkbox2.checked = subTask.completed;
        checkbox2.addEventListener("change", () => {
          void this.engine.toggleTodo(subTask.id).then(() => this.renderList());
        });
        subItem.createSpan({
          text: subTask.text.replace(/^[-*]\s*\[.\]\s*/, "").substring(0, 50),
          cls: subTask.completed ? "is-completed" : ""
        });
      }
      toggleHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        const isCollapsed = subTasksList.classList.toggle("is-collapsed");
        expandIcon.setText(isCollapsed ? "\u25B6" : "\u25BC");
      });
    }
    const link = item.createDiv({ cls: "taskweaver-link" });
    const fileName = todo.filePath.split("/").pop() || todo.filePath;
    link.setText(fileName);
    link.setAttribute("title", `${todo.filePath}:${todo.lineNumber}`);
    link.addEventListener("click", (e) => {
      e.stopPropagation();
      void this.openFile(todo);
    });
    if (this.duplicateIds.has(todo.id)) {
      const badge = item.createDiv({ cls: "taskweaver-badge-dup" });
      badge.setText("DUP");
      badge.setAttribute("title", "This todo appears in multiple files");
    }
    item.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      this.draggedItem = item;
      this.draggedTodoId = todo.id;
      item.addClass("is-dragging");
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", todo.id);
      }
    });
    item.addEventListener("dragend", () => this.onDragEnd());
    item.addEventListener("dragover", (e) => this.onDragOver(e, item));
    item.addEventListener("drop", (e) => this.onDrop(e, item));
    item.addEventListener("contextmenu", (e) => this.showContextMenu(e, todo, board));
  }
  getDateStatusClass(dateStr) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    if (diffDays < 0)
      return "is-overdue";
    if (diffDays === 0)
      return "is-today";
    if (diffDays <= 3)
      return "is-soon";
    return "";
  }
  formatDateRelative(dateStr) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    if (diffDays === 0)
      return "Today";
    if (diffDays === 1)
      return "Tomorrow";
    if (diffDays === -1)
      return "Yesterday";
    if (diffDays > 0 && diffDays <= 7)
      return `${diffDays}d`;
    if (diffDays < 0 && diffDays >= -7)
      return `${Math.abs(diffDays)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  async openFile(todo) {
    const file = this.app.vault.getAbstractFileByPath(todo.filePath);
    if (file instanceof import_obsidian4.TFile) {
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);
      const view = leaf.view;
      if (view.getViewType() === "markdown") {
        const editor = view.editor;
        if (editor) {
          const line = todo.lineNumber - 1;
          editor.setCursor({ line, ch: 0 });
          editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
        }
      }
    }
  }
  onDragStart(e, item, todoId) {
    this.draggedItem = item;
    this.draggedTodoId = todoId;
    item.addClass("is-dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", todoId);
    }
  }
  onDragEnd() {
    if (this.draggedItem) {
      this.draggedItem.removeClass("is-dragging");
      this.draggedItem = null;
      this.draggedTodoId = null;
    }
    this.listEl.querySelectorAll(".drag-over").forEach((el) => el.removeClass("drag-over"));
  }
  onDragOver(e, item) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    this.listEl.querySelectorAll(".drag-over").forEach((el) => el.removeClass("drag-over"));
    if (item !== this.draggedItem) {
      item.addClass("drag-over");
    }
  }
  onDrop(e, targetItem) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.draggedItem || targetItem === this.draggedItem)
      return;
    if (this.viewMode === "list") {
      const items = Array.from(this.listEl.querySelectorAll(".taskweaver-item"));
      const draggedIndex = items.indexOf(this.draggedItem);
      const targetIndex = items.indexOf(targetItem);
      if (draggedIndex < targetIndex) {
        targetItem.after(this.draggedItem);
      } else {
        targetItem.before(this.draggedItem);
      }
      const newOrder = Array.from(this.listEl.querySelectorAll(".taskweaver-item")).map((el) => el.getAttribute("data-id")).filter((id) => id !== null);
      this.engine.updatePriorities(newOrder);
      this.onSettingsChange();
    } else if (this.boardEngine && this.draggedTodoId) {
      const parent = targetItem.parentElement;
      if (parent) {
        const columnId = parent.getAttribute("data-column-id");
        if (columnId) {
          this.boardEngine.assignTodoToColumn(this.viewMode, this.draggedTodoId, columnId);
          this.onSettingsChange();
        }
      }
    }
    targetItem.removeClass("drag-over");
  }
  showContextMenu(e, todo, board) {
    e.preventDefault();
    const menu = new import_obsidian4.Menu();
    menu.addItem((item) => {
      item.setTitle("Open file").setIcon("file").onClick(() => this.openFile(todo));
    });
    menu.addItem((item) => {
      item.setTitle("Move to file...").setIcon("file-input").onClick(() => this.showMoveDialog(todo));
    });
    menu.addItem((item) => {
      item.setTitle("Edit task").setIcon("pencil").onClick(() => {
        new EditTaskModal(this.app, this.engine, todo, () => {
          void this.engine.initialize().then(() => this.onSettingsChange());
        }).open();
      });
    });
    menu.addSeparator();
    if (this.boardEngine && board) {
      for (const column of board.columns) {
        menu.addItem((item) => {
          item.setTitle(`Move to ${column.name}`).setIcon("arrow-right").onClick(() => {
            this.boardEngine.assignTodoToColumn(board.id, todo.id, column.id);
            this.onSettingsChange();
          });
        });
      }
      menu.addSeparator();
    }
    menu.addItem((item) => {
      item.setTitle(todo.completed ? "Mark incomplete" : "Mark complete").setIcon(todo.completed ? "square" : "check-square").onClick(() => this.engine.toggleTodo(todo.id));
    });
    menu.addSeparator();
    if (board && this.boardEngine) {
      const isPinned = this.boardEngine.isBoardPinned(board.id, todo.id);
      menu.addItem((item) => {
        item.setTitle(isPinned ? "Unpin from board" : "Pin in board").setIcon("pin").onClick(() => {
          this.boardEngine.toggleBoardPin(board.id, todo.id);
          this.onSettingsChange();
        });
      });
      menu.addSeparator();
      const currentPriority = this.boardEngine.getTodoPriority(board.id, todo.id);
      menu.addItem((item) => {
        item.setTitle("High priority").setIcon(currentPriority === 1 ? "check" : "circle").onClick(() => {
          this.boardEngine.setTodoPriority(board.id, todo.id, currentPriority === 1 ? 0 : 1);
          this.onSettingsChange();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Medium priority").setIcon(currentPriority === 2 ? "check" : "circle").onClick(() => {
          this.boardEngine.setTodoPriority(board.id, todo.id, currentPriority === 2 ? 0 : 2);
          this.onSettingsChange();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Low priority").setIcon(currentPriority === 3 ? "check" : "circle").onClick(() => {
          this.boardEngine.setTodoPriority(board.id, todo.id, currentPriority === 3 ? 0 : 3);
          this.onSettingsChange();
        });
      });
      menu.addSeparator();
      menu.addItem((item) => {
        item.setTitle("Archive task").setIcon("archive").onClick(() => {
          this.boardEngine.archiveTodo(board.id, todo.id);
          this.onSettingsChange();
        });
      });
    } else {
      menu.addItem((item) => {
        item.setTitle(todo.pinned ? "Unpin" : "Pin to top").setIcon("pin").onClick(() => {
          this.engine.togglePin(todo.id);
          this.onSettingsChange();
        });
      });
      menu.addSeparator();
      const currentPriority = this.engine.getGlobalPriority(todo.id);
      menu.addItem((item) => {
        item.setTitle("High priority").setIcon(currentPriority === 1 ? "check" : "circle").onClick(() => {
          this.engine.setGlobalPriority(todo.id, currentPriority === 1 ? 0 : 1);
          this.onSettingsChange();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Medium priority").setIcon(currentPriority === 2 ? "check" : "circle").onClick(() => {
          this.engine.setGlobalPriority(todo.id, currentPriority === 2 ? 0 : 2);
          this.onSettingsChange();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Low priority").setIcon(currentPriority === 3 ? "check" : "circle").onClick(() => {
          this.engine.setGlobalPriority(todo.id, currentPriority === 3 ? 0 : 3);
          this.onSettingsChange();
        });
      });
      menu.addSeparator();
      menu.addItem((item) => {
        item.setTitle("Archive task").setIcon("archive").onClick(() => {
          this.engine.toggleArchive(todo.id);
          this.onSettingsChange();
        });
      });
    }
    menu.showAtMouseEvent(e);
  }
  showMoveDialog(todo) {
    const files = this.app.vault.getMarkdownFiles().filter((f) => f.path !== todo.filePath).sort((a, b) => a.path.localeCompare(b.path));
    const menu = new import_obsidian4.Menu();
    for (const file of files.slice(0, 20)) {
      menu.addItem((item) => {
        item.setTitle(file.path).onClick(() => {
          void this.engine.moveTodoToFile(todo.id, file.path).then((success) => {
            if (success) {
              this.renderList();
            }
          });
        });
      });
    }
    if (files.length > 20) {
      menu.addItem((item) => {
        item.setTitle(`... and ${files.length - 20} more files`).setDisabled(true);
      });
    }
    menu.showAtPosition({ x: 0, y: 0 });
  }
  async onClose() {
  }
};

// src/engines/BoardEngine.ts
var DEFAULT_COLUMNS = [
  { id: "todo", name: "To Do" },
  { id: "in-progress", name: "In Progress" },
  { id: "done", name: "Done" }
];
var BoardEngine = class {
  constructor(settings, todoEngine) {
    this.onUpdateCallbacks = [];
    this.settings = settings;
    this.todoEngine = todoEngine;
    if (!this.settings.boards) {
      this.settings.boards = [];
    }
  }
  // Board CRUD
  createBoard(name) {
    const board = {
      id: this.generateId(),
      name,
      columns: [...DEFAULT_COLUMNS],
      pinnedIds: [],
      todoAssignments: {},
      todoPriorities: {},
      archivedTodoIds: []
    };
    this.settings.boards.push(board);
    if (!this.settings.activeBoardId) {
      this.settings.activeBoardId = board.id;
    }
    this.notifyUpdate();
    return board;
  }
  deleteBoard(boardId) {
    var _a, _b;
    const index = this.settings.boards.findIndex((b) => b.id === boardId);
    if (index !== -1) {
      this.settings.boards.splice(index, 1);
      if (this.settings.activeBoardId === boardId) {
        this.settings.activeBoardId = (_b = (_a = this.settings.boards[0]) == null ? void 0 : _a.id) != null ? _b : null;
      }
      this.notifyUpdate();
    }
  }
  renameBoard(boardId, name) {
    const board = this.getBoard(boardId);
    if (board) {
      board.name = name;
      this.notifyUpdate();
    }
  }
  getBoard(boardId) {
    return this.settings.boards.find((b) => b.id === boardId);
  }
  getActiveBoard() {
    if (!this.settings.activeBoardId)
      return void 0;
    return this.getBoard(this.settings.activeBoardId);
  }
  setActiveBoard(boardId) {
    if (this.getBoard(boardId)) {
      this.settings.activeBoardId = boardId;
      this.notifyUpdate();
    }
  }
  getAllBoards() {
    return this.settings.boards;
  }
  // Column management
  addColumn(boardId, name) {
    const board = this.getBoard(boardId);
    if (board) {
      board.columns.push({
        id: this.generateId(),
        name
      });
      this.notifyUpdate();
    }
  }
  removeColumn(boardId, columnId) {
    const board = this.getBoard(boardId);
    if (board) {
      board.columns = board.columns.filter((c) => c.id !== columnId);
      for (const todoId of Object.keys(board.todoAssignments)) {
        if (board.todoAssignments[todoId] === columnId) {
          delete board.todoAssignments[todoId];
        }
      }
      this.notifyUpdate();
    }
  }
  renameColumn(boardId, columnId, name) {
    const board = this.getBoard(boardId);
    if (board) {
      const column = board.columns.find((c) => c.id === columnId);
      if (column) {
        column.name = name;
        this.notifyUpdate();
      }
    }
  }
  reorderColumns(boardId, orderedColumnIds) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const newColumns = [];
    for (const id of orderedColumnIds) {
      const column = board.columns.find((c) => c.id === id);
      if (column) {
        newColumns.push(column);
      }
    }
    board.columns = newColumns;
    this.notifyUpdate();
  }
  moveColumn(boardId, columnId, direction) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const index = board.columns.findIndex((c) => c.id === columnId);
    if (index === -1)
      return;
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= board.columns.length)
      return;
    const temp = board.columns[index];
    board.columns[index] = board.columns[newIndex];
    board.columns[newIndex] = temp;
    this.notifyUpdate();
  }
  // Todo assignment to columns
  assignTodoToColumn(boardId, todoId, columnId) {
    const board = this.getBoard(boardId);
    if (board) {
      board.todoAssignments[todoId] = columnId;
      this.notifyUpdate();
    }
  }
  getTodoColumn(boardId, todoId) {
    const board = this.getBoard(boardId);
    if (!board)
      return void 0;
    return board.todoAssignments[todoId];
  }
  // Get todos for a specific column (excluding archived)
  getTodosForColumn(boardId, columnId) {
    var _a;
    const board = this.getBoard(boardId);
    if (!board)
      return [];
    const allTodos = this.todoEngine.getTodos(false);
    const defaultColumnId = (_a = board.columns[0]) == null ? void 0 : _a.id;
    const archivedIds = board.archivedTodoIds || [];
    const column = board.columns.find((c) => c.id === columnId);
    if (!column)
      return [];
    const columnType = column.type || "manual";
    const typeConfig = column.typeConfig || {};
    const filter = column.filterConfig;
    let filteredTodos = allTodos.filter((todo) => {
      var _a2, _b, _c, _d;
      if (archivedIds.includes(todo.id))
        return false;
      switch (columnType) {
        case "completed":
          return todo.completed;
        case "undated":
          return !todo.completed && !todo.dueDate;
        case "overdue":
          if (todo.completed || !todo.dueDate)
            return false;
          return this.isOverdue(todo.dueDate);
        case "dated":
          if (todo.completed || !todo.dueDate)
            return false;
          return this.isInDateRange(todo.dueDate, (_a2 = typeConfig.dateFrom) != null ? _a2 : 0, (_b = typeConfig.dateTo) != null ? _b : 7);
        case "namedTag":
          if (todo.completed)
            return false;
          if (!typeConfig.tag)
            return false;
          return ((_c = todo.tags) == null ? void 0 : _c.includes(typeConfig.tag)) || todo.text.includes(typeConfig.tag);
        case "manual":
        default:
          if (todo.completed)
            return false;
          const assignedColumn = (_d = board.todoAssignments[todo.id]) != null ? _d : defaultColumnId;
          return assignedColumn === columnId;
      }
    });
    if (filter) {
      filteredTodos = filteredTodos.filter((todo) => {
        if (!filter.showCompleted && todo.completed)
          return false;
        if (!filter.showIncomplete && !todo.completed)
          return false;
        if (filter.priorities.length > 0) {
          const todoPriority = board.todoPriorities[todo.id] || 0;
          if (!filter.priorities.includes(todoPriority))
            return false;
        }
        if (filter.tags.length > 0) {
          const hasTag = filter.tags.some((tag) => todo.text.includes(tag));
          if (!hasTag)
            return false;
        }
        return true;
      });
    }
    return filteredTodos.sort((a, b) => {
      const aPinned = board.pinnedIds.includes(a.id);
      const bPinned = board.pinnedIds.includes(b.id);
      if (aPinned && !bPinned)
        return -1;
      if (!aPinned && bPinned)
        return 1;
      return 0;
    });
  }
  // Helper: check if date is overdue
  isOverdue(dateStr) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }
  // Helper: check if date is in range (days from today)
  isInDateRange(dateStr, fromDays, toDays) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
    return diffDays >= fromDays && diffDays <= toDays;
  }
  // Board-specific pinning
  toggleBoardPin(boardId, todoId) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const index = board.pinnedIds.indexOf(todoId);
    if (index === -1) {
      board.pinnedIds.push(todoId);
    } else {
      board.pinnedIds.splice(index, 1);
    }
    this.notifyUpdate();
  }
  isBoardPinned(boardId, todoId) {
    const board = this.getBoard(boardId);
    if (!board)
      return false;
    return board.pinnedIds.includes(todoId);
  }
  // Priority management (1=high, 2=medium, 3=low, 0=none)
  getTodoPriority(boardId, todoId) {
    const board = this.getBoard(boardId);
    if (!board || !board.todoPriorities)
      return 0;
    return board.todoPriorities[todoId] || 0;
  }
  setTodoPriority(boardId, todoId, priority) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    if (!board.todoPriorities) {
      board.todoPriorities = {};
    }
    if (priority === 0) {
      delete board.todoPriorities[todoId];
    } else {
      board.todoPriorities[todoId] = priority;
    }
    this.notifyUpdate();
  }
  // Column settings
  setColumnType(boardId, columnId, type, config) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const column = board.columns.find((c) => c.id === columnId);
    if (column) {
      column.type = type;
      column.typeConfig = config;
      this.notifyUpdate();
    }
  }
  toggleColumnMinimized(boardId, columnId) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const column = board.columns.find((c) => c.id === columnId);
    if (column) {
      column.minimized = !column.minimized;
      this.notifyUpdate();
    }
  }
  setColumnWorkLimit(boardId, columnId, limit) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const column = board.columns.find((c) => c.id === columnId);
    if (column) {
      column.workLimit = limit;
      this.notifyUpdate();
    }
  }
  setColumnSortConfig(boardId, columnId, config) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const column = board.columns.find((c) => c.id === columnId);
    if (column) {
      column.sortConfig = config;
      this.notifyUpdate();
    }
  }
  toggleHideEmptyColumns(boardId) {
    const board = this.getBoard(boardId);
    if (board) {
      board.hideEmptyColumns = !board.hideEmptyColumns;
      this.notifyUpdate();
    }
  }
  setColumnFilter(boardId, columnId, config) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    const column = board.columns.find((c) => c.id === columnId);
    if (column) {
      column.filterConfig = config;
      this.notifyUpdate();
    }
  }
  // Archive management
  archiveTodo(boardId, todoId) {
    const board = this.getBoard(boardId);
    if (!board)
      return;
    if (!board.archivedTodoIds) {
      board.archivedTodoIds = [];
    }
    if (!board.archivedTodoIds.includes(todoId)) {
      board.archivedTodoIds.push(todoId);
      this.notifyUpdate();
    }
  }
  unarchiveTodo(boardId, todoId) {
    const board = this.getBoard(boardId);
    if (!board || !board.archivedTodoIds)
      return;
    const index = board.archivedTodoIds.indexOf(todoId);
    if (index !== -1) {
      board.archivedTodoIds.splice(index, 1);
      this.notifyUpdate();
    }
  }
  isArchived(boardId, todoId) {
    var _a;
    const board = this.getBoard(boardId);
    return ((_a = board == null ? void 0 : board.archivedTodoIds) == null ? void 0 : _a.includes(todoId)) || false;
  }
  getArchivedTodos(boardId) {
    const board = this.getBoard(boardId);
    if (!board || !board.archivedTodoIds)
      return [];
    const allTodos = this.todoEngine.getTodos(false);
    return allTodos.filter((todo) => board.archivedTodoIds.includes(todo.id));
  }
  archiveCompletedTodos(boardId) {
    var _a;
    const board = this.getBoard(boardId);
    if (!board)
      return 0;
    const completedTodos = this.todoEngine.getTodos(false).filter((t) => t.completed);
    let count = 0;
    for (const todo of completedTodos) {
      if (!((_a = board.archivedTodoIds) == null ? void 0 : _a.includes(todo.id))) {
        if (!board.archivedTodoIds)
          board.archivedTodoIds = [];
        board.archivedTodoIds.push(todo.id);
        count++;
      }
    }
    if (count > 0)
      this.notifyUpdate();
    return count;
  }
  // Callbacks
  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
  }
  notifyUpdate() {
    for (const callback of this.onUpdateCallbacks) {
      callback();
    }
  }
  generateId() {
    return Math.random().toString(36).substring(2, 10);
  }
};

// src/views/BoardView.ts
var import_obsidian9 = require("obsidian");

// src/modals/ColumnTypeModal.ts
var import_obsidian5 = require("obsidian");

// src/utils/ColumnTypeUtils.ts
var COLUMN_TYPE_ICONS = {
  manual: "edit-3",
  completed: "check-circle-2",
  undated: "inbox",
  overdue: "alert-circle",
  dated: "calendar",
  namedTag: "tag"
};
var COLUMN_TYPE_LABELS = {
  manual: "Manual",
  completed: "Completed",
  undated: "No Date",
  overdue: "Overdue",
  dated: "Dated",
  namedTag: "Tag"
};
var COLUMN_TYPE_DESCRIPTIONS = {
  manual: "Tasks are assigned by dragging or from context menu.",
  completed: "Automatically shows all completed tasks.",
  undated: "Shows tasks without a due date.",
  overdue: "Shows tasks with past due dates.",
  dated: "Shows tasks within a date range.",
  namedTag: "Shows tasks with a specific tag."
};
function getColumnTypeIcon(type) {
  return COLUMN_TYPE_ICONS[type] || "edit-3";
}
function getColumnTypeLabel(type) {
  return COLUMN_TYPE_LABELS[type] || type;
}
function getColumnTypeDescription(type) {
  return COLUMN_TYPE_DESCRIPTIONS[type] || "";
}

// src/modals/ColumnTypeModal.ts
var ColumnTypeModal = class extends import_obsidian5.Modal {
  constructor(app, columnName, currentType, currentConfig, onSave) {
    super(app);
    this.columnName = columnName;
    this.currentType = currentType || "manual";
    this.currentConfig = currentConfig || {};
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("taskweaver-column-type-modal");
    contentEl.createEl("h3", { text: `Configure Column: ${this.columnName}` });
    new import_obsidian5.Setting(contentEl).setName("Column type").setDesc("How tasks are assigned to this column").addDropdown((dropdown) => {
      dropdown.addOption("manual", "Manual (drag & drop)").addOption("completed", "Completed Tasks").addOption("undated", "No Due Date").addOption("overdue", "Overdue").addOption("dated", "Date Range").addOption("namedTag", "By Tag").setValue(this.currentType).onChange((value) => {
        this.currentType = value;
        this.renderTypeConfig(contentEl);
      });
    });
    const configContainer = contentEl.createDiv({ cls: "taskweaver-type-config" });
    this.renderTypeConfig(contentEl);
    const footer = contentEl.createDiv({ cls: "taskweaver-modal-actions" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    cancelBtn.addEventListener("click", () => this.close());
    const saveBtn = footer.createEl("button", { text: "Save", cls: "mod-cta" });
    saveBtn.addEventListener("click", () => {
      this.onSave(this.currentType, this.currentConfig);
      this.close();
    });
  }
  renderTypeConfig(container) {
    const oldConfig = container.querySelector(".taskweaver-type-config");
    if (oldConfig)
      oldConfig.remove();
    const configEl = container.createDiv({ cls: "taskweaver-type-config" });
    switch (this.currentType) {
      case "dated":
        new import_obsidian5.Setting(configEl).setName("Date range").setDesc("Days from today").addText((text) => {
          var _a;
          text.setPlaceholder("From (e.g., 0)").setValue(String((_a = this.currentConfig.dateFrom) != null ? _a : 0)).onChange((val) => {
            this.currentConfig.dateFrom = parseInt(val) || 0;
          });
          text.inputEl.type = "number";
          text.inputEl.addClass("taskweaver-number-narrow");
        }).addText((text) => {
          var _a;
          text.setPlaceholder("To (e.g., 7)").setValue(String((_a = this.currentConfig.dateTo) != null ? _a : 7)).onChange((val) => {
            this.currentConfig.dateTo = parseInt(val) || 7;
          });
          text.inputEl.type = "number";
          text.inputEl.addClass("taskweaver-number-narrow");
        });
        break;
      case "namedTag":
        new import_obsidian5.Setting(configEl).setName("Tag").setDesc("Filter by this tag (e.g., #project)").addText((text) => {
          text.setPlaceholder("#tag").setValue(this.currentConfig.tag || "").onChange((val) => {
            this.currentConfig.tag = val;
          });
        });
        break;
      default:
        configEl.createEl("p", {
          text: getColumnTypeDescription(this.currentType),
          cls: "setting-item-description"
        });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/BoardSettingsModal.ts
var import_obsidian6 = require("obsidian");
var BoardSettingsModal = class extends import_obsidian6.Modal {
  constructor(app, board, boardEngine, onSave) {
    super(app);
    this.board = board;
    this.boardEngine = boardEngine;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("taskweaver-board-settings-modal");
    contentEl.createEl("h2", { text: `Board Settings: ${this.board.name}` });
    new import_obsidian6.Setting(contentEl).setName("Board name").addText((text) => {
      text.setValue(this.board.name).onChange((value) => {
        this.boardEngine.renameBoard(this.board.id, value);
      });
    });
    contentEl.createEl("h3", { text: "Columns" });
    const columnsContainer = contentEl.createDiv({ cls: "taskweaver-columns-list" });
    this.renderColumns(columnsContainer);
    const addColumnBtn = contentEl.createEl("button", {
      text: "+ Add Column",
      cls: "mod-cta taskweaver-add-column-btn"
    });
    addColumnBtn.addEventListener("click", () => {
      this.boardEngine.addColumn(this.board.id, "New Column");
      this.onSave();
      this.renderColumns(columnsContainer);
    });
    contentEl.createEl("h3", { text: "Options" });
    new import_obsidian6.Setting(contentEl).setName("Hide empty columns").setDesc("Automatically hide columns with no tasks").addToggle((toggle) => {
      toggle.setValue(this.board.hideEmptyColumns || false).onChange(() => {
        this.boardEngine.toggleHideEmptyColumns(this.board.id);
        this.onSave();
      });
    });
    const footer = contentEl.createDiv({ cls: "taskweaver-modal-actions" });
    const closeBtn = footer.createEl("button", { text: "Done", cls: "mod-cta" });
    closeBtn.addEventListener("click", () => this.close());
  }
  renderColumns(container) {
    container.empty();
    for (const column of this.board.columns) {
      const columnRow = container.createDiv({ cls: "taskweaver-column-row" });
      const dragHandle = columnRow.createSpan({ cls: "taskweaver-column-drag" });
      (0, import_obsidian6.setIcon)(dragHandle, "grip-vertical");
      const nameInput = columnRow.createEl("input", {
        type: "text",
        value: column.name,
        cls: "taskweaver-column-name-input"
      });
      nameInput.addEventListener("change", () => {
        this.boardEngine.renameColumn(this.board.id, column.id, nameInput.value);
        this.onSave();
      });
      const typeBadge = columnRow.createSpan({ cls: "taskweaver-column-type-badge" });
      (0, import_obsidian6.setIcon)(typeBadge, getColumnTypeIcon(column.type || "manual"));
      typeBadge.setAttribute("aria-label", getColumnTypeLabel(column.type || "manual"));
      const deleteBtn = columnRow.createEl("button", { cls: "taskweaver-column-delete" });
      (0, import_obsidian6.setIcon)(deleteBtn, "trash-2");
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Delete column "${column.name}"?`)) {
          this.boardEngine.removeColumn(this.board.id, column.id);
          this.onSave();
          this.renderColumns(container);
        }
      });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/InputModal.ts
var import_obsidian7 = require("obsidian");
var InputModal = class extends import_obsidian7.Modal {
  constructor(app, title, label, defaultValue, onSubmit) {
    super(app);
    this.title = title;
    this.label = label;
    this.defaultValue = defaultValue;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h3", { text: this.title });
    const setting = new import_obsidian7.Setting(contentEl).setName(this.label);
    setting.addText((text) => {
      this.inputEl = text.inputEl;
      text.setValue(this.defaultValue);
      text.inputEl.focus();
      text.inputEl.select();
      text.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.submit();
        }
      });
    });
    new import_obsidian7.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Cancel").onClick(() => this.close())
    ).addButton(
      (btn) => btn.setButtonText("OK").setCta().onClick(() => this.submit())
    );
  }
  submit() {
    this.onSubmit(this.inputEl.value);
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/components/FilterPopover.ts
var import_obsidian8 = require("obsidian");

// src/utils/FilterState.ts
var DEFAULT_FILTER_STATE = {
  showCompleted: true,
  showOverdue: true,
  showToday: true,
  showUpcoming: true,
  showNoDate: true,
  priorityFilter: "all",
  tagFilter: null
};
function countActiveFilters(state) {
  let count = 0;
  if (!state.showCompleted)
    count++;
  if (!state.showOverdue)
    count++;
  if (!state.showToday)
    count++;
  if (!state.showUpcoming)
    count++;
  if (!state.showNoDate)
    count++;
  if (state.priorityFilter !== "all")
    count++;
  if (state.tagFilter !== null)
    count++;
  return count;
}

// src/utils/TodoFilterer.ts
function filterTodos(todos, filter) {
  return todos.filter((todo) => matchesFilter(todo, filter));
}
function matchesFilter(todo, filter) {
  if (!filter.showCompleted && todo.completed) {
    return false;
  }
  if (todo.dueDate) {
    const dateStatus = getDateStatus(todo.dueDate);
    if (!filter.showOverdue && dateStatus === "overdue") {
      return false;
    }
    if (!filter.showToday && dateStatus === "today") {
      return false;
    }
    if (!filter.showUpcoming && dateStatus === "upcoming") {
      return false;
    }
  } else {
    if (!filter.showNoDate) {
      return false;
    }
  }
  if (filter.priorityFilter !== "all") {
    const priority = extractPriority(todo.text);
    if (filter.priorityFilter === "high" && priority !== "high")
      return false;
    if (filter.priorityFilter === "medium" && priority !== "medium")
      return false;
    if (filter.priorityFilter === "low" && priority !== "low")
      return false;
    if (filter.priorityFilter === "none" && priority !== "none")
      return false;
  }
  if (filter.tagFilter !== null) {
    if (!todo.tags || !todo.tags.includes(filter.tagFilter)) {
      return false;
    }
  }
  return true;
}
function getDateStatus(dateStr) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
  if (diffDays < 0)
    return "overdue";
  if (diffDays === 0)
    return "today";
  if (diffDays <= 7)
    return "upcoming";
  return "future";
}
function extractPriority(text) {
  if (text.includes("\u23EB") || text.includes("\u{1F53A}"))
    return "high";
  if (text.includes("\u{1F53C}"))
    return "medium";
  if (text.includes("\u{1F53D}"))
    return "low";
  return "none";
}
function getAllTags(todos) {
  const tagSet = /* @__PURE__ */ new Set();
  todos.forEach((todo) => {
    if (todo.tags) {
      todo.tags.forEach((tag) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}

// src/components/FilterPopover.ts
var FilterPopover = class {
  constructor(containerEl, todos, initialState, onChange) {
    this.popoverEl = null;
    this.handleOutsideClick = (e) => {
      if (this.popoverEl && !this.popoverEl.contains(e.target)) {
        this.closePopover();
      }
    };
    this.containerEl = containerEl;
    this.todos = todos;
    this.state = initialState || { ...DEFAULT_FILTER_STATE };
    this.onChange = onChange;
    this.render();
  }
  render() {
    const filterBtn = this.containerEl.createDiv({ cls: "taskweaver-filter-btn" });
    (0, import_obsidian8.setIcon)(filterBtn, "filter");
    const activeCount = countActiveFilters(this.state);
    if (activeCount > 0) {
      filterBtn.addClass("has-active-filters");
      const badge = filterBtn.createSpan({ cls: "taskweaver-filter-badge" });
      badge.setText(String(activeCount));
    }
    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.togglePopover(filterBtn);
    });
  }
  togglePopover(anchorEl) {
    if (this.popoverEl) {
      this.closePopover();
      return;
    }
    this.popoverEl = document.body.createDiv({ cls: "taskweaver-filter-popover" });
    const rect = anchorEl.getBoundingClientRect();
    this.popoverEl.style.top = `${rect.bottom + 4}px`;
    this.popoverEl.style.left = `${rect.left}px`;
    this.renderPopoverContent();
    setTimeout(() => {
      document.addEventListener("click", this.handleOutsideClick);
    }, 0);
  }
  closePopover() {
    document.removeEventListener("click", this.handleOutsideClick);
    if (this.popoverEl) {
      this.popoverEl.remove();
      this.popoverEl = null;
    }
  }
  renderPopoverContent() {
    if (!this.popoverEl)
      return;
    this.popoverEl.empty();
    const header = this.popoverEl.createDiv({ cls: "taskweaver-fp-header" });
    header.createEl("h4", { text: "Filters" });
    const clearBtn = header.createEl("button", { text: "Clear all", cls: "taskweaver-fp-clear" });
    clearBtn.addEventListener("click", () => {
      this.state = { ...DEFAULT_FILTER_STATE };
      this.renderPopoverContent();
      this.onChange(this.state);
    });
    const statusSection = this.popoverEl.createDiv({ cls: "taskweaver-fp-section" });
    statusSection.createEl("label", { text: "Status" });
    this.createToggle(statusSection, "Show Completed", this.state.showCompleted, (v) => {
      this.state.showCompleted = v;
      this.onChange(this.state);
    });
    const dateSection = this.popoverEl.createDiv({ cls: "taskweaver-fp-section" });
    dateSection.createEl("label", { text: "Due date" });
    this.createToggle(dateSection, "Overdue", this.state.showOverdue, (v) => {
      this.state.showOverdue = v;
      this.onChange(this.state);
    });
    this.createToggle(dateSection, "Today", this.state.showToday, (v) => {
      this.state.showToday = v;
      this.onChange(this.state);
    });
    this.createToggle(dateSection, "Upcoming", this.state.showUpcoming, (v) => {
      this.state.showUpcoming = v;
      this.onChange(this.state);
    });
    this.createToggle(dateSection, "No Date", this.state.showNoDate, (v) => {
      this.state.showNoDate = v;
      this.onChange(this.state);
    });
    const prioritySection = this.popoverEl.createDiv({ cls: "taskweaver-fp-section" });
    prioritySection.createEl("label", { text: "Priority" });
    const prioritySelect = prioritySection.createEl("select", { cls: "taskweaver-fp-select" });
    const options = [
      { value: "all", label: "All Priorities" },
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
      { value: "none", label: "No Priority" }
    ];
    options.forEach((opt) => {
      const optEl = prioritySelect.createEl("option", { value: opt.value, text: opt.label });
      if (opt.value === this.state.priorityFilter) {
        optEl.selected = true;
      }
    });
    prioritySelect.addEventListener("change", () => {
      this.state.priorityFilter = prioritySelect.value;
      this.onChange(this.state);
    });
    const tags = getAllTags(this.todos);
    if (tags.length > 0) {
      const tagSection = this.popoverEl.createDiv({ cls: "taskweaver-fp-section" });
      tagSection.createEl("label", { text: "Tag" });
      const tagSelect = tagSection.createEl("select", { cls: "taskweaver-fp-select" });
      tagSelect.createEl("option", { value: "", text: "All tags" });
      tags.forEach((tag) => {
        const optEl = tagSelect.createEl("option", { value: tag, text: tag });
        if (tag === this.state.tagFilter) {
          optEl.selected = true;
        }
      });
      tagSelect.addEventListener("change", () => {
        this.state.tagFilter = tagSelect.value || null;
        this.onChange(this.state);
      });
    }
  }
  createToggle(container, label, value, onChange) {
    const row = container.createDiv({ cls: "taskweaver-fp-toggle-row" });
    const checkbox = row.createEl("input", { type: "checkbox" });
    checkbox.checked = value;
    row.createSpan({ text: label });
    checkbox.addEventListener("change", () => {
      onChange(checkbox.checked);
    });
  }
  destroy() {
    this.closePopover();
  }
};

// src/utils/DateUtils.ts
function getDaysFromToday(dateStr) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return Math.floor((date.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
}
function getDateStatusClass(dateStr) {
  const diffDays = getDaysFromToday(dateStr);
  if (diffDays < 0)
    return "is-overdue";
  if (diffDays === 0)
    return "is-today";
  if (diffDays <= 3)
    return "is-soon";
  return "";
}
function formatDateRelative(dateStr) {
  const diffDays = getDaysFromToday(dateStr);
  if (diffDays === 0)
    return "Today";
  if (diffDays === 1)
    return "Tomorrow";
  if (diffDays === -1)
    return "Yesterday";
  if (diffDays > 0 && diffDays <= 7)
    return `${diffDays}d`;
  if (diffDays < 0 && diffDays >= -7)
    return `${Math.abs(diffDays)}d ago`;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// src/views/BoardView.ts
var VIEW_TYPE_BOARD = "taskweaver-board-view";
var BoardView = class extends import_obsidian9.ItemView {
  constructor(leaf, todoEngine, boardEngine, onSettingsChange) {
    super(leaf);
    this.draggedItem = null;
    this.draggedTodoId = null;
    this.draggedColumnId = null;
    this.searchFilter = "";
    this.searchDebounceTimer = null;
    this.isComposing = false;
    this.filterState = { ...DEFAULT_FILTER_STATE };
    this.filterPopover = null;
    this.todoEngine = todoEngine;
    this.boardEngine = boardEngine;
    this.onSettingsChange = onSettingsChange;
  }
  getViewType() {
    return VIEW_TYPE_BOARD;
  }
  getDisplayText() {
    const board = this.boardEngine.getActiveBoard();
    return board ? `Board: ${board.name}` : "Kanban Board";
  }
  getIcon() {
    return "layout-grid";
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("taskweaver-board-container");
    this.containerEl_ = contentEl;
    this.render();
    this.todoEngine.onUpdate(() => this.render());
    this.boardEngine.onUpdate(() => this.render());
  }
  triggerDebouncedSearch(searchInput) {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      const cursorPos = searchInput.selectionStart;
      this.render();
      const newInput = this.containerEl_.querySelector(".taskweaver-board-search");
      if (newInput) {
        newInput.focus();
        if (cursorPos !== null) {
          newInput.setSelectionRange(cursorPos, cursorPos);
        }
      }
    }, 300);
  }
  render() {
    this.containerEl_.empty();
    const header = this.containerEl_.createDiv({ cls: "taskweaver-board-header" });
    this.renderBoardSelector(header);
    const searchWrap = header.createDiv({ cls: "taskweaver-board-search-wrap" });
    const searchInput = searchWrap.createEl("input", {
      type: "text",
      placeholder: "Search todos...",
      cls: "taskweaver-board-search"
    });
    searchInput.value = this.searchFilter;
    searchInput.addEventListener("compositionstart", () => {
      this.isComposing = true;
    });
    searchInput.addEventListener("compositionend", () => {
      this.isComposing = false;
      this.triggerDebouncedSearch(searchInput);
    });
    searchInput.addEventListener("input", () => {
      this.searchFilter = searchInput.value;
      if (this.isComposing)
        return;
      this.triggerDebouncedSearch(searchInput);
    });
    const filterWrap = header.createDiv({ cls: "taskweaver-filter-wrap" });
    const allTodos = this.todoEngine.getTodos();
    this.filterPopover = new FilterPopover(filterWrap, allTodos, this.filterState, (newState) => {
      this.filterState = newState;
      this.render();
    });
    const settingsBtn = header.createEl("button", { cls: "taskweaver-settings-btn" });
    (0, import_obsidian9.setIcon)(settingsBtn, "settings");
    settingsBtn.setAttribute("aria-label", "Board Settings");
    const board = this.boardEngine.getActiveBoard();
    if (board) {
      settingsBtn.addEventListener("click", () => {
        new BoardSettingsModal(this.app, board, this.boardEngine, () => {
          this.onSettingsChange();
        }).open();
      });
    }
    if (!board) {
      this.containerEl_.createDiv({
        text: "No boards yet. Click + to create one.",
        cls: "taskweaver-board-empty"
      });
      return;
    }
    const columnsEl = this.containerEl_.createDiv({ cls: "taskweaver-board-columns" });
    for (const column of board.columns) {
      if (board.hideEmptyColumns) {
        const todos = this.boardEngine.getTodosForColumn(board.id, column.id);
        if (todos.length === 0)
          continue;
      }
      this.renderColumn(columnsEl, board, column);
    }
    const archivedTodos = this.boardEngine.getArchivedTodos(board.id);
    if (archivedTodos.length > 0) {
      this.renderArchiveColumn(columnsEl, board, archivedTodos);
    }
    const addColumnBtn = columnsEl.createDiv({ cls: "taskweaver-board-add-column" });
    addColumnBtn.setText("+ Add Column");
    addColumnBtn.addEventListener("click", () => this.promptAddColumn(board.id));
  }
  renderBoardSelector(container) {
    const boards = this.boardEngine.getAllBoards();
    const activeBoard = this.boardEngine.getActiveBoard();
    const selector = container.createDiv({ cls: "taskweaver-board-selector" });
    const select = selector.createEl("select", { cls: "taskweaver-board-select" });
    if (boards.length === 0) {
      select.createEl("option", { text: "No boards", value: "" });
    } else {
      for (const board of boards) {
        const option = select.createEl("option", {
          text: board.name,
          value: board.id
        });
        if (activeBoard && board.id === activeBoard.id) {
          option.selected = true;
        }
      }
    }
    select.addEventListener("change", () => {
      if (select.value) {
        this.boardEngine.setActiveBoard(select.value);
        this.onSettingsChange();
      }
    });
    const addBtn = selector.createEl("button", { cls: "taskweaver-board-add-btn" });
    addBtn.setText("+");
    addBtn.setAttribute("title", "New board");
    addBtn.addEventListener("click", () => this.promptCreateBoard());
    if (activeBoard) {
      const deleteBtn = selector.createEl("button", { cls: "taskweaver-board-delete-btn" });
      deleteBtn.setText("\u{1F5D1}");
      deleteBtn.setAttribute("title", "Delete board");
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Delete board "${activeBoard.name}"?`)) {
          this.boardEngine.deleteBoard(activeBoard.id);
          this.onSettingsChange();
        }
      });
    }
  }
  renderColumn(container, board, column) {
    const columnEl = container.createDiv({ cls: "taskweaver-board-column" });
    columnEl.setAttribute("data-column-id", column.id);
    columnEl.setAttribute("draggable", "true");
    columnEl.addEventListener("dragstart", (e) => {
      if (e.target === columnEl) {
        this.draggedColumnId = column.id;
        columnEl.addClass("is-column-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("column-id", column.id);
        }
      }
    });
    columnEl.addEventListener("dragend", () => {
      columnEl.removeClass("is-column-dragging");
      this.draggedColumnId = null;
      container.querySelectorAll(".column-drag-over").forEach((el) => el.removeClass("column-drag-over"));
    });
    columnEl.addEventListener("dragover", (e) => {
      if (this.draggedColumnId && this.draggedColumnId !== column.id) {
        e.preventDefault();
        if (e.dataTransfer)
          e.dataTransfer.dropEffect = "move";
        columnEl.addClass("column-drag-over");
      }
    });
    columnEl.addEventListener("dragleave", () => {
      columnEl.removeClass("column-drag-over");
    });
    columnEl.addEventListener("drop", (e) => {
      e.preventDefault();
      columnEl.removeClass("column-drag-over");
      if (this.draggedColumnId && this.draggedColumnId !== column.id) {
        const columns = board.columns.map((c) => c.id);
        const fromIndex = columns.indexOf(this.draggedColumnId);
        const toIndex = columns.indexOf(column.id);
        if (fromIndex !== -1 && toIndex !== -1) {
          columns.splice(fromIndex, 1);
          columns.splice(toIndex, 0, this.draggedColumnId);
          this.boardEngine.reorderColumns(board.id, columns);
          this.onSettingsChange();
        }
      }
    });
    const headerEl = columnEl.createDiv({ cls: "taskweaver-column-header" });
    if (column.minimized) {
      columnEl.addClass("is-minimized");
    }
    const todoCount = this.boardEngine.getTodosForColumn(board.id, column.id).length;
    if (column.workLimit && todoCount > column.workLimit) {
      columnEl.addClass("over-work-limit");
    }
    const titleEl = headerEl.createSpan({ text: column.name, cls: "taskweaver-column-title" });
    const countEl = headerEl.createSpan({
      text: `(${todoCount}${column.workLimit ? "/" + column.workLimit : ""})`,
      cls: "taskweaver-column-count"
    });
    if (column.workLimit && todoCount > column.workLimit) {
      const warningEl = headerEl.createSpan({ cls: "taskweaver-work-limit-warning" });
      (0, import_obsidian9.setIcon)(warningEl, "alert-triangle");
      warningEl.setAttribute("aria-label", `Over work limit (${todoCount}/${column.workLimit})`);
    }
    titleEl.addEventListener("click", () => {
      this.boardEngine.toggleColumnMinimized(board.id, column.id);
      this.onSettingsChange();
    });
    headerEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const menu = new import_obsidian9.Menu();
      menu.addItem((item) => {
        item.setTitle("Rename").setIcon("pencil").onClick(() => this.promptRenameColumn(board.id, column));
      });
      menu.addSeparator();
      menu.addItem((item) => {
        item.setTitle("Move left").setIcon("arrow-left").onClick(() => {
          this.boardEngine.moveColumn(board.id, column.id, "left");
          this.onSettingsChange();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Move right").setIcon("arrow-right").onClick(() => {
          this.boardEngine.moveColumn(board.id, column.id, "right");
          this.onSettingsChange();
        });
      });
      menu.addSeparator();
      menu.addItem((item) => {
        item.setTitle(column.minimized ? "Expand Column" : "Minimize Column").setIcon(column.minimized ? "maximize-2" : "minimize-2").onClick(() => {
          this.boardEngine.toggleColumnMinimized(board.id, column.id);
          this.onSettingsChange();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Set work limit").setIcon("gauge").onClick(() => this.promptSetWorkLimit(board.id, column));
      });
      menu.addItem((item) => {
        const typeLabel = column.type ? `Type: ${getColumnTypeLabel(column.type)}` : "Configure Type";
        item.setTitle(typeLabel).setIcon("settings-2").onClick(() => {
          new ColumnTypeModal(
            this.app,
            column.name,
            column.type || "manual",
            column.typeConfig,
            (type, config) => {
              this.boardEngine.setColumnType(board.id, column.id, type, config);
              this.onSettingsChange();
            }
          ).open();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Sort by priority").setIcon("arrow-up-down").onClick(() => {
          this.boardEngine.setColumnSortConfig(
            board.id,
            column.id,
            { criteria: "priority", order: "asc" }
          );
          this.onSettingsChange();
        });
      });
      menu.addItem((item) => {
        item.setTitle("Sort by name").setIcon("sort-asc").onClick(() => {
          this.boardEngine.setColumnSortConfig(
            board.id,
            column.id,
            { criteria: "name", order: "asc" }
          );
          this.onSettingsChange();
        });
      });
      menu.addSeparator();
      menu.addItem((item) => {
        item.setTitle("Delete").setIcon("trash").onClick(() => {
          this.boardEngine.removeColumn(board.id, column.id);
          this.onSettingsChange();
        });
      });
      menu.showAtMouseEvent(e);
    });
    let todos = this.boardEngine.getTodosForColumn(board.id, column.id);
    if (this.searchFilter) {
      const filter = this.searchFilter.toLowerCase();
      todos = todos.filter(
        (t) => t.text.toLowerCase().includes(filter) || t.filePath.toLowerCase().includes(filter)
      );
    }
    todos = filterTodos(todos, this.filterState);
    const todosEl = columnEl.createDiv({ cls: "taskweaver-column-todos" });
    todosEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer)
        e.dataTransfer.dropEffect = "move";
      todosEl.addClass("drag-over");
    });
    todosEl.addEventListener("dragleave", () => {
      todosEl.removeClass("drag-over");
    });
    todosEl.addEventListener("drop", (e) => {
      e.preventDefault();
      todosEl.removeClass("drag-over");
      let todoId = this.draggedTodoId;
      if (!todoId && e.dataTransfer) {
        todoId = e.dataTransfer.getData("text/plain");
      }
      if (todoId) {
        this.boardEngine.assignTodoToColumn(board.id, todoId, column.id);
        this.onSettingsChange();
      }
    });
    const count = headerEl.createSpan({ text: ` (${todos.length})`, cls: "taskweaver-column-count" });
    for (const todo of todos) {
      this.renderTodoCard(todosEl, board, todo);
    }
    const columnType = column.type || "manual";
    if (columnType === "manual") {
      const quickAddContainer = columnEl.createDiv({ cls: "taskweaver-quick-add" });
      const quickAddInput = quickAddContainer.createEl("input", {
        type: "text",
        placeholder: "+ Add task...",
        cls: "taskweaver-quick-add-input"
      });
      quickAddInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && quickAddInput.value.trim()) {
          const taskText = quickAddInput.value.trim();
          void this.quickAddTask(taskText, board.id, column.id);
          quickAddInput.value = "";
        }
      });
      quickAddInput.addEventListener("blur", () => {
        if (quickAddInput.value.trim()) {
          const taskText = quickAddInput.value.trim();
          void this.quickAddTask(taskText, board.id, column.id);
          quickAddInput.value = "";
        }
      });
    }
  }
  renderTodoCard(container, board, todo) {
    const card = container.createDiv({ cls: "taskweaver-board-card" });
    card.setAttribute("data-todo-id", todo.id);
    card.setAttribute("draggable", "true");
    if (todo.completed) {
      card.addClass("is-completed");
    }
    if (this.boardEngine.isBoardPinned(board.id, todo.id)) {
      card.addClass("is-pinned");
    }
    const priority = this.boardEngine.getTodoPriority(board.id, todo.id);
    if (priority === 1) {
      card.addClass("priority-high");
    } else if (priority === 2) {
      card.addClass("priority-medium");
    } else if (priority === 3) {
      card.addClass("priority-low");
    }
    const header = card.createDiv({ cls: "taskweaver-card-header" });
    const checkbox = header.createEl("input", { type: "checkbox", cls: "taskweaver-card-checkbox" });
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      void this.todoEngine.toggleTodo(todo.id);
    });
    const cleanText = todo.text.replace(/(?:📅|📆|due::?)\d{4}-\d{2}-\d{2}/g, "").replace(/#[\w\-/]+/g, "").trim();
    const textEl = header.createDiv({ cls: "taskweaver-card-text" });
    textEl.setText(cleanText || todo.text);
    const footer = card.createDiv({ cls: "taskweaver-card-footer" });
    if (todo.dueDate) {
      const dateStatus = this.getDateStatus(todo.dueDate);
      const dateBadge = footer.createSpan({ cls: `taskweaver-card-date ${dateStatus}` });
      dateBadge.setText(this.formatDate(todo.dueDate));
    }
    if (todo.tags && todo.tags.length > 0) {
      const tagsContainer = footer.createDiv({ cls: "taskweaver-card-tags" });
      for (const tag of todo.tags.slice(0, 3)) {
        const tagEl = tagsContainer.createSpan({ cls: "taskweaver-card-tag" });
        tagEl.setText(tag);
      }
      if (todo.tags.length > 3) {
        const moreEl = tagsContainer.createSpan({ cls: "taskweaver-card-tag-more" });
        moreEl.setText(`+${todo.tags.length - 3}`);
      }
    }
    if (this.todoEngine.hasSubTasks(todo.id)) {
      const progress = this.todoEngine.getSubTaskProgress(todo.id);
      const subTasksSection = card.createDiv({ cls: "taskweaver-subtasks-section" });
      const toggleHeader = subTasksSection.createDiv({ cls: "taskweaver-subtasks-toggle" });
      const expandIcon = toggleHeader.createSpan({ cls: "taskweaver-subtasks-icon", text: "\u25B6" });
      const progressText = toggleHeader.createSpan({ cls: "taskweaver-subtasks-progress" });
      const percent = Math.round(progress.completed / progress.total * 100);
      const progressBar = progressText.createSpan({ cls: "taskweaver-progress-bar" });
      const progressFill = progressBar.createSpan();
      progressFill.style.width = `${percent}%`;
      progressText.createSpan({ text: ` ${progress.completed}/${progress.total}` });
      const subTasksList = subTasksSection.createDiv({ cls: "taskweaver-subtasks-list is-collapsed" });
      const subTasks = this.todoEngine.getSubTasks(todo.id);
      for (const subTask of subTasks) {
        const subItem = subTasksList.createDiv({ cls: "taskweaver-subtask-item" });
        const checkbox2 = subItem.createEl("input", { type: "checkbox" });
        checkbox2.checked = subTask.completed;
        checkbox2.addEventListener("change", () => {
          void this.todoEngine.toggleTodo(subTask.id).then(() => this.render());
        });
        subItem.createSpan({
          text: subTask.text.replace(/^[-*]\s*\[.\]\s*/, "").substring(0, 50),
          cls: subTask.completed ? "is-completed" : ""
        });
      }
      toggleHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        const isCollapsed = subTasksList.classList.toggle("is-collapsed");
        expandIcon.setText(isCollapsed ? "\u25B6" : "\u25BC");
      });
    }
    const link = footer.createDiv({ cls: "taskweaver-card-link" });
    const fileName = todo.filePath.split("/").pop() || todo.filePath;
    link.setText(fileName);
    link.addEventListener("click", () => this.openFile(todo));
    card.addEventListener("dragstart", (e) => {
      this.draggedItem = card;
      this.draggedTodoId = todo.id;
      card.addClass("is-dragging");
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", todo.id);
      }
    });
    card.addEventListener("dragend", () => {
      card.removeClass("is-dragging");
      this.draggedItem = null;
      this.draggedTodoId = null;
    });
    card.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      new EditTaskModal(this.app, this.todoEngine, todo, () => {
        this.render();
      }).open();
    });
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.showCardContextMenu(e, board, todo);
    });
  }
  // Delegate to shared utilities
  getDateStatus(dateStr) {
    return getDateStatusClass(dateStr);
  }
  formatDate(dateStr) {
    return "\u{1F4C5} " + formatDateRelative(dateStr);
  }
  renderArchiveColumn(container, board, archivedTodos) {
    const columnEl = container.createDiv({ cls: "taskweaver-board-column taskweaver-archive-column" });
    const header = columnEl.createDiv({ cls: "taskweaver-column-header" });
    const titleEl = header.createDiv({ cls: "taskweaver-column-title" });
    titleEl.setText(`Archive (${archivedTodos.length})`);
    const clearBtn = header.createEl("button", { cls: "taskweaver-archive-clear-btn" });
    clearBtn.setText("Clear All");
    clearBtn.setAttribute("title", "Remove all archived items");
    clearBtn.addEventListener("click", () => {
      if (confirm("Remove all archived tasks from this board?")) {
        for (const todo of archivedTodos) {
          this.boardEngine.unarchiveTodo(board.id, todo.id);
        }
        this.onSettingsChange();
      }
    });
    const listEl = columnEl.createDiv({ cls: "taskweaver-column-todos" });
    for (const todo of archivedTodos) {
      const card = listEl.createDiv({
        cls: `taskweaver-card taskweaver-archived-card ${todo.completed ? "is-completed" : ""}`
      });
      const text = card.createDiv({ cls: "taskweaver-card-text" });
      text.setText(todo.text);
      const link = card.createDiv({ cls: "taskweaver-card-link" });
      const fileName = todo.filePath.split("/").pop() || todo.filePath;
      link.setText(fileName);
      link.addEventListener("click", () => this.openFile(todo));
      card.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const menu = new import_obsidian9.Menu();
        menu.addItem((item) => {
          item.setTitle("Restore from archive").setIcon("archive-restore").onClick(() => {
            this.boardEngine.unarchiveTodo(board.id, todo.id);
            this.onSettingsChange();
          });
        });
        menu.addItem((item) => {
          item.setTitle("Open file").setIcon("file").onClick(() => this.openFile(todo));
        });
        menu.showAtMouseEvent(e);
      });
    }
  }
  showCardContextMenu(e, board, todo) {
    const menu = new import_obsidian9.Menu();
    menu.addItem((item) => {
      item.setTitle("Open file").setIcon("file").onClick(() => this.openFile(todo));
    });
    menu.addItem((item) => {
      item.setTitle("Move to file...").setIcon("file-input").onClick(() => this.showMoveDialog(todo));
    });
    menu.addItem((item) => {
      item.setTitle("Edit task").setIcon("pencil").onClick(() => {
        new EditTaskModal(this.app, this.todoEngine, todo, () => {
          void this.todoEngine.initialize().then(() => this.onSettingsChange());
        }).open();
      });
    });
    menu.addSeparator();
    for (const column of board.columns) {
      menu.addItem((item) => {
        item.setTitle(`Move to ${column.name}`).setIcon("arrow-right").onClick(() => {
          this.boardEngine.assignTodoToColumn(board.id, todo.id, column.id);
          this.onSettingsChange();
        });
      });
    }
    menu.addSeparator();
    const isPinned = this.boardEngine.isBoardPinned(board.id, todo.id);
    menu.addItem((item) => {
      item.setTitle(isPinned ? "Unpin from this board" : "Pin in this board").setIcon("pin").onClick(() => {
        this.boardEngine.toggleBoardPin(board.id, todo.id);
        this.onSettingsChange();
      });
    });
    menu.addItem((item) => {
      item.setTitle(todo.completed ? "Mark incomplete" : "Mark complete").setIcon(todo.completed ? "square" : "check-square").onClick(() => this.todoEngine.toggleTodo(todo.id));
    });
    menu.addSeparator();
    const currentPriority = this.boardEngine.getTodoPriority(board.id, todo.id);
    menu.addItem((item) => {
      item.setTitle("High priority").setIcon(currentPriority === 1 ? "check" : "circle").onClick(() => {
        this.boardEngine.setTodoPriority(board.id, todo.id, currentPriority === 1 ? 0 : 1);
        this.onSettingsChange();
      });
    });
    menu.addItem((item) => {
      item.setTitle("Medium priority").setIcon(currentPriority === 2 ? "check" : "circle").onClick(() => {
        this.boardEngine.setTodoPriority(board.id, todo.id, currentPriority === 2 ? 0 : 2);
        this.onSettingsChange();
      });
    });
    menu.addItem((item) => {
      item.setTitle("Low priority").setIcon(currentPriority === 3 ? "check" : "circle").onClick(() => {
        this.boardEngine.setTodoPriority(board.id, todo.id, currentPriority === 3 ? 0 : 3);
        this.onSettingsChange();
      });
    });
    menu.addSeparator();
    menu.addItem((item) => {
      item.setTitle("Archive task").setIcon("archive").onClick(() => {
        this.boardEngine.archiveTodo(board.id, todo.id);
        this.onSettingsChange();
      });
    });
    menu.showAtMouseEvent(e);
  }
  showMoveDialog(todo) {
    const files = this.app.vault.getMarkdownFiles().filter((f) => f.path !== todo.filePath).sort((a, b) => a.path.localeCompare(b.path));
    const menu = new import_obsidian9.Menu();
    for (const file of files.slice(0, 20)) {
      menu.addItem((item) => {
        item.setTitle(file.path).onClick(() => {
          void this.todoEngine.moveTodoToFile(todo.id, file.path).then((success) => {
            if (success) {
              this.onSettingsChange();
            }
          });
        });
      });
    }
    if (files.length > 20) {
      menu.addItem((item) => {
        item.setTitle(`... and ${files.length - 20} more files`).setDisabled(true);
      });
    }
    menu.showAtPosition({ x: 0, y: 0 });
  }
  async quickAddTask(text, boardId, columnId) {
    const defaultFilePath = "Tasks.md";
    let file = this.app.vault.getAbstractFileByPath(defaultFilePath);
    if (!file) {
      await this.app.vault.create(defaultFilePath, "# Tasks\n\n");
      file = this.app.vault.getAbstractFileByPath(defaultFilePath);
    }
    if (file instanceof import_obsidian9.TFile) {
      const content = await this.app.vault.read(file);
      const newTask = `- [ ] ${text}`;
      const newContent = content.trimEnd() + "\n" + newTask + "\n";
      await this.app.vault.modify(file, newContent);
      setTimeout(() => {
        const todos = this.todoEngine.getTodos(false);
        const newTodo = todos.find(
          (t) => t.filePath === defaultFilePath && t.text.includes(text)
        );
        if (newTodo) {
          this.boardEngine.assignTodoToColumn(boardId, newTodo.id, columnId);
          this.onSettingsChange();
        }
      }, 300);
    }
  }
  async openFile(todo) {
    const file = this.app.vault.getAbstractFileByPath(todo.filePath);
    if (file instanceof import_obsidian9.TFile) {
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);
      const view = leaf.view;
      if (view.getViewType() === "markdown") {
        const editor = view.editor;
        if (editor) {
          const line = todo.lineNumber - 1;
          editor.setCursor({ line, ch: 0 });
          editor.scrollIntoView({ from: { line, ch: 0 }, to: { line, ch: 0 } }, true);
        }
      }
    }
  }
  promptCreateBoard() {
    new InputModal(this.app, "New Board", "Enter board name:", "", (name) => {
      if (name && name.trim()) {
        this.boardEngine.createBoard(name.trim());
        this.onSettingsChange();
      }
    }).open();
  }
  promptAddColumn(boardId) {
    new InputModal(this.app, "New Column", "Enter column name:", "", (name) => {
      if (name && name.trim()) {
        this.boardEngine.addColumn(boardId, name.trim());
        this.onSettingsChange();
      }
    }).open();
  }
  promptRenameColumn(boardId, column) {
    new InputModal(this.app, "Rename Column", "Enter new column name:", column.name, (name) => {
      if (name && name.trim()) {
        this.boardEngine.renameColumn(boardId, column.id, name.trim());
        this.onSettingsChange();
      }
    }).open();
  }
  promptSetWorkLimit(boardId, column) {
    var _a;
    const currentLimit = ((_a = column.workLimit) == null ? void 0 : _a.toString()) || "";
    new InputModal(this.app, "Set Work Limit", "Enter max tasks (leave empty to disable):", currentLimit, (value) => {
      const limit = value.trim() ? parseInt(value.trim(), 10) : void 0;
      if (limit === void 0 || !isNaN(limit) && limit > 0) {
        this.boardEngine.setColumnWorkLimit(boardId, column.id, limit);
        this.onSettingsChange();
      }
    }).open();
  }
  async onClose() {
  }
};

// src/modals/AddTaskModal.ts
var import_obsidian10 = require("obsidian");
var AddTaskModal = class extends import_obsidian10.Modal {
  // 0=none, 1=high, 2=medium, 3=low
  constructor(app, todoEngine, onTaskAdded) {
    super(app);
    this.taskText = "";
    this.targetFile = null;
    this.dueDate = "";
    this.priority = 0;
    this.todoEngine = todoEngine;
    this.onTaskAdded = onTaskAdded;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("taskweaver-add-task-modal");
    new import_obsidian10.Setting(contentEl).setName("Add new task").setHeading();
    new import_obsidian10.Setting(contentEl).setName("Task").setDesc("Enter the task description").addText((text) => {
      text.setPlaceholder("What needs to be done?").onChange((value) => {
        this.taskText = value;
      });
      text.inputEl.addClass("taskweaver-task-input");
      setTimeout(() => text.inputEl.focus(), 50);
      text.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.submit();
        }
      });
    });
    new import_obsidian10.Setting(contentEl).setName("Add to file").setDesc("Select where to add this task").addDropdown((dropdown) => {
      const files = this.app.vault.getMarkdownFiles().sort((a, b) => b.stat.mtime - a.stat.mtime);
      dropdown.addOption("", "-- Active file --");
      for (const file of files.slice(0, 50)) {
        dropdown.addOption(file.path, file.basename);
      }
      dropdown.onChange((value) => {
        const abstractFile = value ? this.app.vault.getAbstractFileByPath(value) : null;
        this.targetFile = abstractFile instanceof import_obsidian10.TFile ? abstractFile : null;
      });
    });
    new import_obsidian10.Setting(contentEl).setName("Due date").setDesc("Optional: Set a due date").addText((text) => {
      text.setPlaceholder("YYYY-MM-DD").onChange((value) => {
        this.dueDate = value;
      });
      text.inputEl.type = "date";
    });
    new import_obsidian10.Setting(contentEl).setName("Priority").addDropdown((dropdown) => {
      dropdown.addOption("0", "None").addOption("1", "High").addOption("2", "Medium").addOption("3", "Low").onChange((value) => {
        this.priority = parseInt(value);
      });
    });
    new import_obsidian10.Setting(contentEl).addButton((btn) => btn.setButtonText("Add task").setCta().onClick(() => {
      void this.submit();
    })).addButton((btn) => btn.setButtonText("Cancel").onClick(() => this.close()));
  }
  async submit() {
    if (!this.taskText.trim()) {
      new import_obsidian10.Notice("Task text cannot be empty");
      return;
    }
    let taskLine = `- [ ] ${this.taskText.trim()}`;
    if (this.dueDate) {
      taskLine += ` \u{1F4C5} ${this.dueDate}`;
    }
    if (this.priority === 1) {
      taskLine += " \u23EB";
    } else if (this.priority === 2) {
      taskLine += " \u{1F53C}";
    } else if (this.priority === 3) {
      taskLine += " \u{1F53D}";
    }
    let file = this.targetFile;
    if (!file) {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile && activeFile.extension === "md") {
        file = activeFile;
      }
    }
    if (!file) {
      new import_obsidian10.Notice("No target file selected");
      return;
    }
    try {
      const content = await this.app.vault.read(file);
      const newContent = content + "\n" + taskLine;
      await this.app.vault.modify(file, newContent);
      new import_obsidian10.Notice(`Task added to ${file.basename}`);
      this.close();
      this.onTaskAdded();
    } catch (error) {
      new import_obsidian10.Notice("Failed to add task: " + error);
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// main.ts
var DEFAULT_SETTINGS = {
  priorityOrder: [],
  hideCompleted: true,
  excludeFolders: [],
  includeFolders: [],
  tagFilters: [],
  pinnedIds: [],
  priorities: {},
  archivedIds: [],
  boardSettings: {
    boards: [],
    activeBoardId: null
  }
};
var TaskweaverPlugin = class extends import_obsidian11.Plugin {
  async onload() {
    await this.loadSettings();
    this.engine = new TodoEngine(
      this.app.vault,
      this.app.metadataCache,
      this.settings
    );
    this.boardEngine = new BoardEngine(
      this.settings.boardSettings,
      this.engine
    );
    this.registerView(VIEW_TYPE_TODO, (leaf) => new TodoView(leaf, this.engine, () => this.saveSettings(), this.boardEngine));
    this.registerView(VIEW_TYPE_BOARD, (leaf) => new BoardView(leaf, this.engine, this.boardEngine, () => this.saveSettings()));
    this.addRibbonIcon("check-square", "Open todo list", () => {
      this.activateSidebarView(VIEW_TYPE_TODO);
    });
    this.addRibbonIcon("layout-grid", "Open kanban board", () => {
      this.activateMainView(VIEW_TYPE_BOARD);
    });
    this.addCommand({
      id: "open-sidebar",
      name: "Open sidebar",
      callback: () => this.activateSidebarView(VIEW_TYPE_TODO)
    });
    this.addCommand({
      id: "open-board",
      name: "Open kanban board",
      callback: () => this.activateMainView(VIEW_TYPE_BOARD)
    });
    this.addCommand({
      id: "refresh-list",
      name: "Refresh task list",
      callback: () => {
        void this.engine.initialize();
      }
    });
    this.addCommand({
      id: "add-new-task",
      name: "Add new task",
      callback: () => {
        new AddTaskModal(this.app, this.engine, () => {
          void this.engine.initialize().then(() => this.saveSettings());
        }).open();
      }
    });
    this.addRibbonIcon("plus-circle", "Add new task", () => {
      new AddTaskModal(this.app, this.engine, () => {
        void this.engine.initialize().then(() => this.saveSettings());
      }).open();
    });
    this.addSettingTab(new TaskweaverSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(async () => {
      await this.engine.initialize();
    });
  }
  onunload() {
    try {
      if (this.engine) {
        this.engine.destroy();
      }
    } catch (e) {
      console.error("TaskWeaver: Error during unload", e);
    }
  }
  async activateSidebarView(viewType) {
    var _a;
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(viewType);
    if (leaves.length > 0) {
      leaf = (_a = leaves[0]) != null ? _a : null;
    } else {
      const rightLeaf = workspace.getRightLeaf(false);
      if (rightLeaf) {
        leaf = rightLeaf;
        await leaf.setViewState({ type: viewType, active: true });
      }
    }
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
  async activateMainView(viewType) {
    var _a;
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(viewType);
    if (leaves.length > 0) {
      leaf = (_a = leaves[0]) != null ? _a : null;
    } else {
      leaf = workspace.getLeaf("tab");
      if (leaf) {
        await leaf.setViewState({ type: viewType, active: true });
      }
    }
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    if (!this.settings.boardSettings) {
      this.settings.boardSettings = { boards: [], activeBoardId: null };
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var TaskweaverSettingTab = class extends import_obsidian11.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian11.Setting(containerEl).setName("General").setHeading();
    new import_obsidian11.Setting(containerEl).setName("Hide completed todos").setDesc("When enabled, completed todos will not appear in the list.").addToggle((toggle) => toggle.setValue(this.plugin.settings.hideCompleted).onChange(async (value) => {
      this.plugin.settings.hideCompleted = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian11.Setting(containerEl).setName("Exclude folders").setDesc('Comma-separated list of folder paths to exclude from scanning (e.g., "templates, archive/old").').addTextArea((text) => text.setPlaceholder("templates, archive").setValue(this.plugin.settings.excludeFolders.join(", ")).onChange(async (value) => {
      this.plugin.settings.excludeFolders = value.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      await this.plugin.saveSettings();
      await this.plugin.engine.initialize();
    }));
    new import_obsidian11.Setting(containerEl).setName("Rescan vault").setDesc("Manually rescan all files for todos.").addButton((button) => button.setButtonText("Rescan").onClick(() => {
      void this.plugin.engine.initialize();
    }));
  }
};

/* nosourcemap */