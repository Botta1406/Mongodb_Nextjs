

'use client';

import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, Toaster } from 'react-hot-toast';

type Task = {
    _id: string;
    task: string;
    completed: boolean;
};

export default function HomePage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedText, setEditedText] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(setTasks)
            .catch(error => {
                console.error(error);
                toast.error('Failed to load tasks.');
            });
    }, []);

    const addTask = async () => {
        if (!newTask.trim()) {
            // Display error message if task is empty
            toast.error('Please enter a task.');
            return;
        }

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ task: newTask }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                setTasks(prev => [...prev, data]);
                setNewTask('');
                toast.success('Task added successfully!');
            } else {
                toast.error('Failed to add task.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to add task.');
        }
    };

    const deleteTask = async (id: string) => {
        const originalTasks = [...tasks];
        setTasks(prev => prev.filter(t => t._id !== id));

        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Task deleted successfully!');
            } else {
                setTasks(originalTasks); // Rollback on failure
                toast.error('Failed to delete task.');
            }
        } catch (error) {
            console.error(error);
            setTasks(originalTasks); // Rollback on error
            toast.error('Failed to delete task.');
        }
    };

    const toggleComplete = async (task: Task) => {
        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: 'PATCH',
                body: JSON.stringify({ completed: !task.completed }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setTasks(prev =>
                    prev.map(t => (t._id === task._id ? { ...t, completed: !t.completed } : t))
                );
                toast.success(`Task ${task.completed ? 'unmarked' : 'marked'} as complete.`);
            } else {
                toast.error('Failed to update task status.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update task status.');
        }
    };

    const handleEditClick = (task: Task) => {
        setEditingId(task._id);
        setEditedText(task.task);
        setShowModal(true);
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            const res = await fetch(`/api/tasks/${editingId}`, {
                method: 'PATCH',
                body: JSON.stringify({ task: editedText }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                setTasks(prev =>
                    prev.map(t => (t._id === editingId ? { ...t, task: editedText } : t))
                );
                setEditingId(null);
                setShowModal(false);
                toast.success('Task updated successfully!');
            } else {
                const errorData = await res.json();
                toast.error(`Failed to update task: ${errorData?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update task.');
        }
    };

    return (
        <main className="bg-light min-vh-100 py-5">
            <div className="container">
                <div className="mx-auto p-4 bg-white shadow rounded" style={{ maxWidth: '600px' }}>
                    <h1 className="text-center mb-4">My Todo List</h1>

                    <div className="input-group mb-4">
                        <input
                            value={newTask}
                            onChange={e => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                            className="form-control"
                        />
                        <button onClick={addTask} className="btn btn-primary">
                            Add
                        </button>
                    </div>

                    <ul className="list-group">
                        {tasks.map(task => (
                            <li key={task._id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="flex-grow-1 me-3">
                                    <span className={task.completed ? 'text-decoration-line-through text-muted' : ''}>
                                        {task.task}
                                    </span>
                                </div>
                                <div className="form-check form-switch ms-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleComplete(task)}
                                        title="Toggle Complete"
                                    />
                                </div>
                                <div className="btn-group align-items-center" role="group">
                                    <button
                                        onClick={() => handleEditClick(task)}
                                        className="btn btn-sm btn-warning"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteTask(task._id)}
                                        className="btn btn-sm btn-danger ms-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Modal for Editing */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        value={editedText}
                        onChange={e => setEditedText(e.target.value)}
                        className="form-control"
                        placeholder="Edit task..."
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={saveEdit}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}


