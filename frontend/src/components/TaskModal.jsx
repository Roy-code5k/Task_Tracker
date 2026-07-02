import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function TaskModal({ 
  isOpen, onClose, onSubmit, editingTask, formValues, onChange 
}) {
  const [errors, setErrors] = useState({});

  // Reset validation errors when modal opens/closes or when editing task changes
  useEffect(() => {
    setErrors({});
  }, [isOpen, editingTask]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate Title
    const titleVal = formValues.title || '';
    if (!titleVal.trim()) {
      newErrors.title = 'Task title is required';
    } else if (titleVal.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (titleVal.trim().length > 80) {
      newErrors.title = 'Title cannot exceed 80 characters';
    }

    // Validate Description
    const descVal = formValues.description || '';
    if (descVal.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    // Validate Due Date
    const dueDateVal = formValues.dueDate;
    if (dueDateVal) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDateVal);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    // Validate Estimated Time (Hours & Minutes)
    const hrsVal = formValues.estHours;
    if (hrsVal !== undefined && hrsVal !== null && hrsVal !== '') {
      const num = Number(hrsVal);
      if (isNaN(num)) {
        newErrors.estHours = 'Must be a number';
      } else if (num < 0) {
        newErrors.estHours = 'Cannot be negative';
      }
    }

    const minsVal = formValues.estMinutes;
    if (minsVal !== undefined && minsVal !== null && minsVal !== '') {
      const num = Number(minsVal);
      if (isNaN(num)) {
        newErrors.estMinutes = 'Must be a number';
      } else if (num < 0) {
        newErrors.estMinutes = 'Cannot be negative';
      } else if (num > 59) {
        newErrors.estMinutes = 'Must be 0-59';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(e);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2>{editingTask ? 'Edit Task Details' : 'Create New Task'}</h2>
          <button className="close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input 
                type="text" 
                id="title"
                name="title" 
                className={`form-input ${errors.title ? 'is-invalid' : ''}`} 
                placeholder="Enter task name..."
                value={formValues.title} 
                onChange={(e) => {
                  if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                  onChange(e);
                }}
                required
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description"
                name="description" 
                className={`form-textarea ${errors.description ? 'is-invalid' : ''}`} 
                placeholder="Provide details about this task..."
                value={formValues.description} 
                onChange={(e) => {
                  if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                  onChange(e);
                }}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select 
                  id="status"
                  name="status" 
                  className="form-select"
                  value={formValues.status} 
                  onChange={onChange}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select 
                  id="priority"
                  name="priority" 
                  className="form-select"
                  value={formValues.priority} 
                  onChange={onChange}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input 
                  type="text" 
                  id="category"
                  name="category" 
                  className="form-input" 
                  placeholder="e.g., Work, Design, Personal"
                  value={formValues.category} 
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input 
                  type="date" 
                  id="dueDate"
                  name="dueDate" 
                  className={`form-input ${errors.dueDate ? 'is-invalid' : ''}`}
                  value={formValues.dueDate} 
                  onChange={(e) => {
                    if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: null }));
                    onChange(e);
                  }}
                />
                {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="tags">Tags (comma separated)</label>
                <input 
                  type="text" 
                  id="tags"
                  name="tags" 
                  className="form-input" 
                  placeholder="tag1, tag2, tag3"
                  value={formValues.tags} 
                  onChange={onChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Est. Time</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <input 
                      type="number" 
                      name="estHours" 
                      className={`form-input ${errors.estHours ? 'is-invalid' : ''}`}
                      placeholder="Hours"
                      min="0"
                      value={formValues.estHours} 
                      onChange={(e) => {
                        if (errors.estHours) setErrors(prev => ({ ...prev, estHours: null }));
                        onChange(e);
                      }}
                    />
                    {errors.estHours && <span className="error-text" style={{ fontSize: '0.7rem' }}>{errors.estHours}</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <input 
                      type="number" 
                      name="estMinutes" 
                      className={`form-input ${errors.estMinutes ? 'is-invalid' : ''}`}
                      placeholder="Mins"
                      min="0"
                      max="59"
                      value={formValues.estMinutes} 
                      onChange={(e) => {
                        if (errors.estMinutes) setErrors(prev => ({ ...prev, estMinutes: null }));
                        onChange(e);
                      }}
                    />
                    {errors.estMinutes && <span className="error-text" style={{ fontSize: '0.7rem' }}>{errors.estMinutes}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
