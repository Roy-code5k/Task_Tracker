import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all tasks from the API.
 * @returns {Promise<Array>} List of task objects
 */
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    console.error('API Error: getTasks failed', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks from server');
  }
};

/**
 * Creates a new task.
 * @param {Object} taskData - The task fields
 * @returns {Promise<Object>} The created task object
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('API Error: createTask failed', error);
    throw new Error(error.response?.data?.message || 'Failed to create task on server');
  }
};

/**
 * Updates an existing task by ID.
 * @param {string} id - The task document ID
 * @param {Object} taskData - The fields to update
 * @returns {Promise<Object>} The updated task object
 */
export const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`API Error: updateTask for ID ${id} failed`, error);
    throw new Error(error.response?.data?.message || 'Failed to update task on server');
  }
};

/**
 * Deletes a task by ID.
 * @param {string} id - The task ID
 * @returns {Promise<Object>} Deletion status message
 */
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error: deleteTask for ID ${id} failed`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete task on server');
  }
};
