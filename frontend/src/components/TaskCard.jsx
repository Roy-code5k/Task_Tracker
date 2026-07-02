import React from 'react';
import { Edit3, Trash2, Calendar, Check, CheckCircle, Clock } from 'lucide-react';

function TaskCard({ 
  task, onEdit, onDelete, onToggleStatus, onDragStart, onDragEnd, formatDueDate, isOverdue 
}) {
  const formatMinutes = (totalMinutes) => {
    if (!totalMinutes) return '';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  return (
    <div 
      className={`task-card glass-panel status-${task.status} priority-${task.priority}`}
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onDragEnd={onDragEnd}
    >
      <div className="card-header">
        <span className="card-category">{task.category || 'General'}</span>
        <div className="card-actions">
          <button className="action-btn" onClick={() => onEdit(task)} title="Edit">
            <Edit3 size={13} />
          </button>
          <button className="action-btn delete-btn" onClick={() => onDelete(task._id, task.title)} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="card-title" onClick={() => onEdit(task)} style={{ cursor: 'pointer' }}>
        {task.title}
      </div>

      {task.description && (
        <p className="card-description">{task.description}</p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="tag-list" style={{ marginBottom: '0.75rem' }}>
          {task.tags.map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className={`card-due-date ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}>
            <Calendar size={12} />
            <span>{task.dueDate ? formatDueDate(task.dueDate) : 'No due date'}</span>
          </div>
          {task.estimatedTime > 0 && (
            <div className="card-due-date" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={12} />
              <span>Est: {formatMinutes(task.estimatedTime)}</span>
            </div>
          )}
        </div>
        
        {task.status !== 'done' ? (
          <button 
            className="action-btn text-success" 
            onClick={() => onToggleStatus(task)}
            title={isOverdue(task.dueDate, task.status) ? "Mark completed" : "Move status forward"}
            style={{ width: 'auto', padding: '0.1rem 0.4rem', fontSize: '0.75rem', gap: '2px', display: 'flex', alignItems: 'center' }}
          >
            <span>{isOverdue(task.dueDate, task.status) ? 'Complete' : 'Advance'}</span>
            <Check size={12} />
          </button>
        ) : (
          <span className="text-success" style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '2px' }}>
            <CheckCircle size={12} />
            <span>Done</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
