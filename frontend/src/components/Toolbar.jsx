import React from 'react';
import { Search } from 'lucide-react';

function Toolbar({ 
  searchQuery, setSearchQuery,
  filterCategory, setFilterCategory,
  filterPriority, setFilterPriority,
  filterStatus, setFilterStatus,
  sortBy, setSortBy,
  viewMode, allCategories, onClear
}) {
  const showClear = 
    searchQuery || 
    filterCategory !== 'all' || 
    filterPriority !== 'all' || 
    filterStatus !== 'all' || 
    sortBy !== 'createdAt_desc';

  return (
    <section className="toolbar-panel glass-panel">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search tasks by title or description..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="filter-controls">
        <select 
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">📁 All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          className="filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">⚡ All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        {viewMode === 'list' && (
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">🔄 All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="expired">Expired</option>
          </select>
        )}

        {/* Sorting Dropdown */}
        <select 
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt_desc">📅 Newest First</option>
          <option value="createdAt_asc">📅 Oldest First</option>
          <option value="dueDate_asc">⏳ Due Date: Earliest</option>
          <option value="dueDate_desc">⏳ Due Date: Latest</option>
          <option value="priority_desc">🔥 Priority: High to Low</option>
          <option value="priority_asc">🔥 Priority: Low to High</option>
          <option value="estimatedTime_asc">⏱️ Less Time</option>
        </select>

        {showClear && (
          <button className="clear-btn" onClick={onClear} type="button">
            Clear Filters
          </button>
        )}
      </div>
    </section>
  );
}

export default Toolbar;
