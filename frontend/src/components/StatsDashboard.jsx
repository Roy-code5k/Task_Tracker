import React from 'react';
import { ListTodo, Clock, CheckCircle, AlertCircle } from 'lucide-react';

function StatsDashboard({ totalCount, todoCount, progressCount, completedCount, completionRate, totalEstHours, remainingEstHours, expiredCount }) {
  return (
    <section className="dashboard-stats">
      <div className="stat-card glass-panel">
        <div className="stat-details">
          <h3>Total Tasks</h3>
          <div className="stat-value">{totalCount}</div>
        </div>
        <div className="stat-icon total">
          <ListTodo size={24} />
        </div>
      </div>
      <div className="stat-card glass-panel">
        <div className="stat-details">
          <h3>Active Tasks</h3>
          <div className="stat-value">{todoCount + progressCount}</div>
        </div>
        <div className="stat-icon todo">
          <Clock size={24} />
        </div>
      </div>
      <div className="stat-card glass-panel">
        <div className="stat-details">
          <h3>Completed</h3>
          <div className="stat-value">{completedCount}</div>
        </div>
        <div className="stat-icon completed">
          <CheckCircle size={24} />
        </div>
      </div>
      <div className="stat-card glass-panel">
        <div className="stat-details">
          <h3>Expired Tasks</h3>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{expiredCount}</div>
        </div>
        <div className="stat-icon expired" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
          <AlertCircle size={24} />
        </div>
      </div>
      <div className="stat-card glass-panel">
        <div className="stat-details">
          <h3>Est. Time (Left / Total)</h3>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {remainingEstHours} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {totalEstHours}</span>
          </div>
        </div>
        <div className="stat-icon progress">
          <Clock size={24} />
        </div>
      </div>
      <div className="stat-card glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Progress</h3>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{completionRate}%</div>
          </div>
          <div className="stat-progress-bar" style={{ width: '100%', height: '6px', marginTop: '4px', flex: 'none' }}>
            <div className="stat-progress-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsDashboard;
