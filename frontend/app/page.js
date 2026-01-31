'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaCheck, FaPlus, FaCloud, FaServer, FaDatabase } from 'react-icons/fa';

export default function Home() {
  // --- STATE ---
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- 1. FETCH (READ) ---
  const fetchTasks = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error("API Error:", err);
      setError("Cannot connect to Backend. Is your Express server running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- 2. ADD (CREATE) ---
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const taskTitle = newTask; // Store value
    setNewTask(''); // Clear input immediately

    try {
      // Send to backend
      await axios.post(`${API_URL}/tasks`, { 
        title: taskTitle,
        description: "Added via Web Client"
      });
      // Refresh list to get the real ID from database
      fetchTasks(); 
    } catch (err) {
      setError("Failed to add task. Try again.");
      setNewTask(taskTitle); // Restore text if failed
    }
  };

  // --- 3. DELETE (Optimistic) ---
  const deleteTask = async (id) => {
    // 1. Optimistic Update (Remove from UI instantly)
    const previousTasks = [...tasks];
    setTasks(tasks.filter(task => task.id !== id));

    try {
      // 2. Send request in background
      await axios.delete(`${API_URL}/tasks/${id}`);
    } catch (err) {
      // 3. Revert if error
      setTasks(previousTasks);
      alert("Failed to delete task");
    }
  };

  // --- 4. TOGGLE STATUS (Optimistic) ---
  const toggleStatus = async (task) => {
    // 1. Calculate new status
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    
    // 2. Optimistic Update (Update UI instantly)
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    ));

    try {
      // 3. Send to backend
      await axios.put(`${API_URL}/tasks/${task.id}`, { 
        status: newStatus, 
        title: task.title 
      });
    } catch (err) {
      // 4. Revert if error
      setTasks(previousTasks);
      console.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 flex flex-col items-center py-10 px-4 font-sans">
      
      {/* --- HEADER --- */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FaCloud className="text-5xl text-orange-500 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Cloud<span className="text-orange-500">Tasker</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm flex items-center justify-center gap-4">
          <span className="flex items-center gap-1"><FaServer/> Express</span>
          <span className="flex items-center gap-1"><FaDatabase/> MySQL</span>
        </p>
      </header>

      {/* --- MAIN CARD --- */}
      <main className="w-full max-w-lg bg-[#1b1f2b] rounded-2xl shadow-2xl border border-gray-800 p-6 sm:p-8 relative overflow-hidden">
        
        {/* Top Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600"></div>

        {/* --- ERROR MESSAGE --- */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* --- INPUT FORM --- */}
        <form onSubmit={addTask} className="flex gap-3 mb-8">
          <input
            type="text"
            className="flex-1 bg-[#0f111a] border border-gray-700 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-gray-600"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={!newTask.trim() || loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2"
          >
            <FaPlus />
          </button>
        </form>

        {/* --- TASK LIST --- */}
        <div className="space-y-3">
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-10 text-gray-500">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Connecting to Localhost...
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && tasks.length === 0 && (
            <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
              <p>No tasks found.</p>
              <p className="text-sm">Start your server & add one!</p>
            </div>
          )}

          {/* Tasks */}
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                task.status === 'completed' 
                  ? 'bg-[#151821] border-gray-800 opacity-50' 
                  : 'bg-[#232736] border-gray-700 hover:border-gray-600 hover:shadow-lg hover:shadow-black/20'
              }`}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                {/* Checkbox */}
                <button
                  onClick={() => toggleStatus(task)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white scale-110'
                      : 'border-gray-500 hover:border-orange-500'
                  }`}
                >
                  {task.status === 'completed' && <FaCheck size={12} />}
                </button>
                
                {/* Title */}
                <span className={`text-lg truncate transition-colors ${
                  task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-100'
                }`}>
                  {task.title}
                </span>
              </div>

              {/* Delete Button (Only shows on hover for clean look) */}
              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                title="Delete Task"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </main>
      
      {/* --- FOOTER --- */}
      <footer className="mt-10 text-gray-600 text-xs text-center">
        <p>Frontend: Port 3000 | Backend: Port 5000</p>
      </footer>
    </div>
  );
}