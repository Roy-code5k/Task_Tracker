import { useState, useEffect } from 'react';
import { 
  Plus, Clock, AlertCircle, CheckCircle, FolderKanban, 
  Sparkles, Calendar, Edit3, Trash2, Check, RefreshCw 
} from 'lucide-react';
import * as taskService from './services/taskService';
import StatsDashboard from './components/StatsDashboard';
import Toolbar from './components/Toolbar';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import './App.css';

function App() {
  // Task State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI & Filter States
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [dragOverCol, setDragOverCol] = useState(null);
  
  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: '',
    tags: '',
    dueDate: '',
    estHours: '',
    estMinutes: ''
  });

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  // Fetch Tasks on Load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Could not connect to the API server.');
      showToast(err.message || 'API connection failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Open Modal for New Task
  const openCreateModal = () => {
    setEditingTask(null);
    setFormValues({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: '',
      tags: '',
      dueDate: '',
      estHours: '',
      estMinutes: ''
    });
    setShowModal(true);
  };

  // Open Modal for Editing Task
  const openEditModal = (task) => {
    setEditingTask(task);
    const totalMin = task.estimatedTime || 0;
    const hrs = totalMin > 0 ? Math.floor(totalMin / 60) : '';
    const mins = totalMin > 0 ? (totalMin % 60) : '';

    setFormValues({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category || '',
      tags: task.tags ? task.tags.join(', ') : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estHours: hrs,
      estMinutes: mins
    });
    setShowModal(true);
  };

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // Form Submit (Save / Update)
  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();

    const hrs = formValues.estHours ? Number(formValues.estHours) : 0;
    const mins = formValues.estMinutes ? Number(formValues.estMinutes) : 0;
    const totalMinutes = (hrs * 60) + mins;

    const taskPayload = {
      ...formValues,
      tags: formValues.tags 
        ? formValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') 
        : [],
      dueDate: formValues.dueDate ? new Date(formValues.dueDate) : null,
      estimatedTime: totalMinutes
    };

    try {
      if (editingTask) {
        const updated = await taskService.updateTask(editingTask._id, taskPayload);
        setTasks(prev => prev.map(t => t._id === editingTask._id ? updated : t));
        showToast('Task updated successfully!', 'success');
      } else {
        const created = await taskService.createTask(taskPayload);
        setTasks(prev => [created, ...prev]);
        showToast('Task created successfully!', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'danger');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;
    
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast('Task deleted successfully', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'danger');
    }
  };

  // Toggle/Update Status Inline (directly complete if expired)
  const handleToggleStatus = async (task) => {
    let newStatus;
    if (isTaskExpired(task)) {
      newStatus = 'done';
    } else {
      const nextStatusMap = {
        'todo': 'in-progress',
        'in-progress': 'done',
        'done': 'todo'
      };
      newStatus = nextStatusMap[task.status] || 'todo';
    }
    
    try {
      const updated = await taskService.updateTask(task._id, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? updated : t));
      const statusText = newStatus === 'done' ? 'completed' : newStatus.replace('-', ' ');
      showToast(`Status updated to ${statusText}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'danger');
    }
  };

  // Complete/Uncomplete directly (Checkbox click)
  const handleCheckboxClick = async (e, task) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const updated = await taskService.updateTask(task._id, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? updated : t));
      showToast(newStatus === 'done' ? 'Task completed! 🎉' : 'Task marked active', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'danger');
    }
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e, status) => {
    if (status === 'expired') return; // Read-only, no dropping onto Expired
    e.preventDefault();
    setDragOverCol(status);
  };

  const isTaskExpired = (task) => {
    if (task.status === 'done') return false;
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDue = new Date(task.dueDate);
    taskDue.setHours(0, 0, 0, 0);
    return taskDue < today;
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const taskToUpdate = tasks.find(t => t._id === taskId);
    if (!taskToUpdate) return;

    // Expired column does not accept manual drops
    if (status === 'expired') {
      showToast('Tasks are marked expired automatically once their due date passes.', 'info');
      return;
    }

    // Expired tasks can only be dropped into the Completed ('done') column
    if (isTaskExpired(taskToUpdate) && status !== 'done') {
      showToast('Expired tasks can only be moved to Completed.', 'warning');
      return;
    }

    if (taskToUpdate.status === status) return;

    try {
      const updated = await taskService.updateTask(taskId, { ...taskToUpdate, status });
      setTasks(prev => prev.map(t => t._id === taskId ? updated : t));
      showToast(`Task moved to ${status.replace('-', ' ')}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to move task', 'danger');
    }
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterPriority('all');
    setFilterStatus('all');
    setSortBy('createdAt_desc');
  };

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    let matchesStatus = filterStatus === 'all';
    if (filterStatus === 'todo') {
      matchesStatus = task.status === 'todo' && !isTaskExpired(task);
    } else if (filterStatus === 'in-progress') {
      matchesStatus = task.status === 'in-progress' && !isTaskExpired(task);
    } else if (filterStatus === 'done') {
      matchesStatus = task.status === 'done';
    } else if (filterStatus === 'expired') {
      matchesStatus = isTaskExpired(task);
    }
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Sorting Logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'createdAt_desc') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'createdAt_asc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'dueDate_asc') {
      if (!a.dueDate) return 1; // Push items without due date to the bottom
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'dueDate_desc') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    }
    if (sortBy === 'priority_desc') {
      const weights = { high: 3, medium: 2, low: 1 };
      return (weights[b.priority] || 0) - (weights[a.priority] || 0);
    }
    if (sortBy === 'priority_asc') {
      const weights = { high: 3, medium: 2, low: 1 };
      return (weights[a.priority] || 0) - (weights[b.priority] || 0);
    }
    if (sortBy === 'estimatedTime_asc') {
      const aTime = a.estimatedTime || Infinity;
      const bTime = b.estimatedTime || Infinity;
      if (aTime === bTime) return 0;
      return aTime - bTime;
    }
    return 0;
  });

  // Helper to format minutes as Xh Ym
  const formatMinutes = (totalMinutes) => {
    if (!totalMinutes) return '0m';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  // Calculate Metrics
  const totalCount = tasks.length;
  const expiredCount = tasks.filter(t => isTaskExpired(t)).length;
  const todoCount = tasks.filter(t => t.status === 'todo' && !isTaskExpired(t)).length;
  const progressCount = tasks.filter(t => t.status === 'in-progress' && !isTaskExpired(t)).length;
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalEstMinutes = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
  const remainingEstMinutes = tasks.filter(t => t.status !== 'done').reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
  const totalEstHours = formatMinutes(totalEstMinutes);
  const remainingEstHours = formatMinutes(remainingEstMinutes);

  // Extract unique categories for filter select dropdown (only show categories present in task database)
  const allCategories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  // Formatter for Dates
  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Check if date is overdue
  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) < today;
  };

  return (
    <div className="app-container">
      
      {/* Toast Notifications */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification-toast glass-panel ${n.type}`}>
            {n.type === 'success' && <CheckCircle size={18} className="text-success" />}
            {n.type === 'danger' && <AlertCircle size={18} className="text-danger" />}
            {n.type === 'info' && <Clock size={18} className="text-info" />}
            <span>{n.message}</span>
          </div>
        ))}
      </div>

      {/* Header Panel */}
      <header className="app-header glass-panel">
        <div className="brand-section">
          <div className="logo-container">
            <FolderKanban size={24} />
          </div>
          <div className="brand-info">
            <h1>Zenith Task</h1>
            <p>High-Fidelity Project & Task Editor</p>
          </div>
        </div>
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-option ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              type="button"
            >
              <span>Kanban</span>
            </button>
            <button 
              className={`toggle-option ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              <span>List View</span>
            </button>
          </div>
          
          <button className="btn-secondary" onClick={fetchTasks} title="Refresh Tasks" type="button">
            <RefreshCw size={18} />
          </button>

          <button className="btn-primary" onClick={openCreateModal} type="button">
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>
      </header>

      {/* Dashboard Analytics Section */}
      <StatsDashboard 
        totalCount={totalCount}
        todoCount={todoCount}
        progressCount={progressCount}
        completedCount={completedCount}
        completionRate={completionRate}
        totalEstHours={totalEstHours}
        remainingEstHours={remainingEstHours}
        expiredCount={expiredCount}
      />

      {/* Toolbar / Filters Panel */}
      <Toolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        allCategories={allCategories}
        onClear={handleClearFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="empty-state glass-panel">
          <RefreshCw className="empty-icon animate-spin" size={32} />
          <h3>Loading Tasks</h3>
          <p>Syncing with your Express and MongoDB database...</p>
        </div>
      ) : error ? (
        <div className="empty-state glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle className="empty-icon text-danger" size={32} />
          <h3>Connection Error</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchTasks} style={{ marginTop: '1rem' }} type="button">
            Try Again
          </button>
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="empty-state glass-panel">
          <Sparkles className="empty-icon" size={32} />
          <h3>No tasks found</h3>
          <p>Create a task or clear filters to start organizing your work.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="kanban-container">
          
          {/* EXPIRED COLUMN */}
          <div 
            className="kanban-column"
            onDragOver={(e) => handleDragOver(e, 'expired')}
            onDrop={(e) => handleDrop(e, 'expired')}
          >
            <div className="kanban-column-header">
              <span className="column-title" style={{ color: 'var(--danger)' }}>
                <AlertCircle size={16} />
                Expired
              </span>
              <span className="column-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                {sortedTasks.filter(t => isTaskExpired(t)).length}
              </span>
            </div>
            
            <div className={`kanban-cards-wrapper ${dragOverCol === 'expired' ? 'drag-over' : ''}`}>
              {sortedTasks
                .filter(t => isTaskExpired(t))
                .map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    formatDueDate={formatDueDate}
                    isOverdue={isOverdue}
                  />
                ))}
            </div>
          </div>

          {/* TO DO COLUMN */}
          <div 
            className="kanban-column"
            onDragOver={(e) => handleDragOver(e, 'todo')}
            onDrop={(e) => handleDrop(e, 'todo')}
          >
            <div className="kanban-column-header">
              <span className="column-title" style={{ color: 'var(--warning)' }}>
                <Clock size={16} />
                To Do
              </span>
              <span className="column-badge">
                {sortedTasks.filter(t => t.status === 'todo' && !isTaskExpired(t)).length}
              </span>
            </div>
            
            <div className={`kanban-cards-wrapper ${dragOverCol === 'todo' ? 'drag-over' : ''}`}>
              {sortedTasks
                .filter(t => t.status === 'todo' && !isTaskExpired(t))
                .map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    formatDueDate={formatDueDate}
                    isOverdue={isOverdue}
                  />
                ))}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div 
            className="kanban-column"
            onDragOver={(e) => handleDragOver(e, 'in-progress')}
            onDrop={(e) => handleDrop(e, 'in-progress')}
          >
            <div className="kanban-column-header">
              <span className="column-title" style={{ color: 'var(--primary)' }}>
                <RefreshCw size={16} />
                In Progress
              </span>
              <span className="column-badge">
                {sortedTasks.filter(t => t.status === 'in-progress' && !isTaskExpired(t)).length}
              </span>
            </div>
            
            <div className={`kanban-cards-wrapper ${dragOverCol === 'in-progress' ? 'drag-over' : ''}`}>
              {sortedTasks
                .filter(t => t.status === 'in-progress' && !isTaskExpired(t))
                .map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    formatDueDate={formatDueDate}
                    isOverdue={isOverdue}
                  />
                ))}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div 
            className="kanban-column"
            onDragOver={(e) => handleDragOver(e, 'done')}
            onDrop={(e) => handleDrop(e, 'done')}
          >
            <div className="kanban-column-header">
              <span className="column-title" style={{ color: 'var(--success)' }}>
                <CheckCircle size={16} />
                Completed
              </span>
              <span className="column-badge">
                {sortedTasks.filter(t => t.status === 'done').length}
              </span>
            </div>
            
            <div className={`kanban-cards-wrapper ${dragOverCol === 'done' ? 'drag-over' : ''}`}>
              {sortedTasks
                .filter(t => t.status === 'done')
                .map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    formatDueDate={formatDueDate}
                    isOverdue={isOverdue}
                  />
                ))}
            </div>
          </div>

        </div>
      ) : (
        /* List View */
        <div className="list-container">
          {sortedTasks.map(task => (
            <div 
              key={task._id} 
              className={`list-item glass-panel status-${task.status} priority-${task.priority}`}
            >
              <div className="list-checkbox-wrapper">
                <button 
                  className={`custom-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                  onClick={(e) => handleCheckboxClick(e, task)}
                  type="button"
                >
                  <Check size={14} strokeWidth={3} />
                </button>
              </div>

              <div className="list-details" onClick={() => openEditModal(task)} style={{ cursor: 'pointer' }}>
                <h4>{task.title}</h4>
                <p>{task.description || 'No description provided.'}</p>
              </div>

              <div className="list-priority">
                <span className={`priority-pill ${task.priority}`}>
                  {task.priority}
                </span>
              </div>

              <div className="list-due">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {task.dueDate ? (
                    <span className={`list-due ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {formatDueDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                  {task.estimatedTime > 0 && (
                    <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                      <Clock size={12} />
                      Est: {formatMinutes(task.estimatedTime)}
                    </span>
                  )}
                </div>
              </div>

              <div className="list-tags">
                <div className="tag-list">
                  <span className="tag-pill" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
                    {task.category}
                  </span>
                  {task.tags && task.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="list-actions">
                <button 
                  className="action-btn" 
                  onClick={() => openEditModal(task)}
                  title="Edit Task"
                  type="button"
                >
                  <Edit3 size={15} />
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDeleteTask(task._id, task.title)}
                  title="Delete Task"
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Modal Component */}
      <TaskModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        editingTask={editingTask}
        formValues={formValues}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default App;
