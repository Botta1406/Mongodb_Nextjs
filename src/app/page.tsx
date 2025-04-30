

'use client';

import { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Modal, Button, Form, Pagination, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Updated Task interface to include name and email directly
interface Task {
    _id: string;
    task: string;
    name: string;
    email: string;
    completed: boolean;
}

interface FormDataType {
    name: string;
    email: string;
    task: string;
    completed: boolean;
}

// Define status filter type for type safety
type StatusFilter = 'all' | 'completed' | 'incomplete';

export default function HomePage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        email: '',
        task: '',
        completed: false,
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [deleteReason, setDeleteReason] = useState<string>('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const pageSize = 5; // Set to 5 records per page

    const predefinedReasons = [
        '', // To allow no selection initially or for custom input
        'Task is no longer relevant',
        'Task was created in error',
        'Task has been duplicated',
        'Task is blocked and cannot be completed',
        'Other'
    ];
    const [isOtherReason, setIsOtherReason] = useState<boolean>(false);

    // AG Grid column definitions - Updated to use direct name and email fields
    const columnDefs: ColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            cellStyle: { padding: '12px 16px' },
            headerClass: 'custom-header'
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1.5,
            cellStyle: { padding: '12px 16px' },
            headerClass: 'custom-header'
        },
        {
            field: 'task',
            headerName: 'Task Description',
            flex: 1,
            cellStyle: { padding: '12px 16px' },
            headerClass: 'custom-header'
        },
        {
            field: 'completed',
            headerName: 'Status',
            flex: 1,
            cellStyle: { padding: '12px 16px' },
            headerClass: 'custom-header',
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <div className="d-flex align-items-center">
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={params.data.completed}
                                onChange={() => toggleComplete(params.data)}
                                title="Toggle Status"
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                        <span className={`ms-2 badge ${params.value ? 'bg-success' : 'bg-warning'}`} style={{ fontSize: '0.85rem' }}>
                            {params.value ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                );
            },
        },
        {
            headerName: 'Actions',
            flex: 1,
            cellStyle: { padding: '8px 16px' },
            headerClass: 'custom-header',
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <div className="d-flex gap-2">
                        <button
                            onClick={() => handleEditClick(params.data)}
                            className="btn btn-sm btn-warning"
                            style={{ minWidth: '70px' }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => confirmDelete(params.data._id)}
                            className="btn btn-sm btn-danger"
                            style={{ minWidth: '70px' }}
                        >
                            Delete
                        </button>
                    </div>
                );
            }
        }
    ];

    // Default AG Grid options
    const defaultColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        suppressSizeToFit: false
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Apply status filter whenever tasks or statusFilter changes
    useEffect(() => {
        applyStatusFilter();
    }, [tasks, statusFilter]);

    // Calculate total pages whenever filtered tasks change
    useEffect(() => {
        setTotalPages(Math.ceil(filteredTasks.length / pageSize));
        // Reset to first page when filter changes
        if (currentPage !== 1 && filteredTasks.length <= (currentPage - 1) * pageSize) {
            setCurrentPage(1);
        }
    }, [filteredTasks]);

    // Function to apply status filter
    const applyStatusFilter = () => {
        let filtered: Task[];

        switch (statusFilter) {
            case 'completed':
                filtered = tasks.filter(task => task.completed);
                break;
            case 'incomplete':
                filtered = tasks.filter(task => !task.completed);
                break;
            default:
                filtered = [...tasks];
                break;
        }

        setFilteredTasks(filtered);
    };

    // Handle status filter change
    const handleStatusFilterChange = (status: StatusFilter) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    // Load tasks from API with direct name and email fields
    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');

            if (!res.ok) {
                throw new Error(`Failed to fetch tasks: ${res.status}`);
            }

            const data = await res.json();
            setTasks(data);
            setFilteredTasks(data); // Initialize filtered tasks with all tasks
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks.');
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        // For checkbox inputs, use the checked property instead of value
        const newValue = type === 'checkbox' ? checked : value;

        // Update form state with the new value
        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            task: '',
            completed: false
        });
        setEditingId(null);
    };

    const handleModalClose = () => {
        setShowTaskModal(false);
        resetForm();
    };

    const openAddTaskModal = () => {
        resetForm();
        setShowTaskModal(true);
    };

    const validateForm = (): boolean => {
        const { name, email, task } = formData;

        if (!name.trim()) {
            toast.error('Please enter a name.');
            return false;
        }

        if (!email.trim()) {
            toast.error('Please enter an email address.');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.');
            return false;
        }

        if (!task.trim()) {
            toast.error('Please enter a task description.');
            return false;
        }

        return true;
    };

    const saveTask = async () => {
        if (!validateForm()) return;

        try {
            // Send name and email directly to the API
            const apiData = {
                task: formData.task,
                name: formData.name,
                email: formData.email,
                ...(editingId && { completed: formData.completed })
            };

            if (editingId) {
                // Update existing task
                const res = await fetch(`/api/tasks/${editingId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(apiData),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData?.message || 'Failed to update task');
                }

                const updatedTask = await res.json();

                setTasks(prev =>
                    prev.map(t => (t._id === editingId ? {
                        ...t,
                        ...updatedTask,
                        task: formData.task,
                        name: formData.name,
                        email: formData.email,
                        completed: formData.completed
                    } : t))
                );
                toast.success('Task updated successfully!');
                handleModalClose();
            } else {
                // Add new task
                const res = await fetch('/api/tasks', {
                    method: 'POST',
                    body: JSON.stringify(apiData),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!res.ok) {
                    throw new Error('Failed to add task');
                }

                const newTask = await res.json();
                setTasks(prev => [...prev, newTask]);
                toast.success('Task added successfully!');
                handleModalClose();
            }
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error(`Failed to ${editingId ? 'update' : 'add'} task: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const confirmDelete = (id: string) => {
        setTaskToDelete(id);
        setShowDeleteConfirm(true);
        setDeleteReason(''); // Clear any previous reason
        setIsOtherReason(false); // Reset the 'Other' reason input visibility
    };

    const handleDeleteReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeleteReason(e.target.value);
        if (e.target.value !== 'Other') {
            setIsOtherReason(false);
        }
    };

    const handlePredefinedReasonSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedReason = e.target.value;
        setDeleteReason(selectedReason);
        setIsOtherReason(selectedReason === 'Other');
    };

    const deleteTask = async () => {
        if (!taskToDelete) return;

        const id = taskToDelete;
        const originalTasks = [...tasks];
        setTasks(prev => prev.filter(t => t._id !== id));

        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Failed to delete task');
            }

            toast.success('Task deleted successfully!');

            // Update pagination if needed after deletion
            if (currentPage > Math.ceil((filteredTasks.length - 1) / pageSize) && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            setTasks(originalTasks); // Rollback on error
            toast.error('Failed to delete task.');
        } finally {
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
            setDeleteReason('');
            setIsOtherReason(false);
        }
    };

    const toggleComplete = async (task: Task) => {
        const updatedStatus = !task.completed;
        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: updatedStatus }),
            });

            if (!res.ok) {
                throw new Error('Failed to update status');
            }

            setTasks(prev =>
                prev.map(t =>
                    t._id === task._id ? { ...t, completed: updatedStatus } : t
                )
            );
            toast.success('Task status updated!');
        } catch (error) {
            console.error('Error updating task status:', error);
            toast.error('Error updating task status.');
        }
    };

    const handleEditClick = (task: Task) => {
        setFormData({
            name: task.name,
            email: task.email,
            task: task.task,
            completed: task.completed
        });
        setEditingId(task._id);
        setShowTaskModal(true);
    };

    // Generate pagination items
    const renderPaginationItems = () => {
        const items = [];

        // Add "Previous" button
        items.push(
            <Pagination.Prev
                key="prev"
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            />
        );

        // Show up to 5 page numbers, centered around the current page
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        // Add "Next" button
        items.push(
            <Pagination.Next
                key="next"
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
        );

        return items;
    };

    // Calculate visible tasks based on current page and page size
    const visibleTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <main className="min-vh-100" style={{ backgroundColor: "#c5dbf5" }}>
            <div className="mx-auto p-4" data-testid="todo-container">
                <h1 className="text-center mt-5 mb-4" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>My Todo List</h1>

                <div className="d-flex justify-content-center mb-5 gap-5">
                    <button
                        onClick={openAddTaskModal}
                        className="btn btn-primary py-2 px-4"
                        style={{ fontSize: "1rem", fontWeight: "500" }}
                    >
                        + Add New Task
                    </button>

                    <div className="d-flex align-items-center">
                        <span className="me-2 fw-bold">Filter by Status:</span>
                        <Dropdown>
                            <Dropdown.Toggle variant="light" id="dropdown-status-filter" className="py-2 px-3">
                                {statusFilter === 'all' ? 'All Tasks' :
                                    statusFilter === 'completed' ? 'Completed Tasks' : 'Incomplete Tasks'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    active={statusFilter === 'all'}
                                    onClick={() => handleStatusFilterChange('all')}
                                >
                                    All Tasks
                                </Dropdown.Item>
                                <Dropdown.Item
                                    active={statusFilter === 'completed'}
                                    onClick={() => handleStatusFilterChange('completed')}
                                >
                                    Completed Tasks
                                </Dropdown.Item>
                                <Dropdown.Item
                                    active={statusFilter === 'incomplete'}
                                    onClick={() => handleStatusFilterChange('incomplete')}
                                >
                                    Incomplete Tasks
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {filteredTasks.length > 0 ? (
                    <div className="ag-theme-alpine mx-auto mb-5 shadow-sm rounded" style={{ height: '50%', width: '85%' }}>
                        <AgGridReact
                            rowData={visibleTasks}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            domLayout="autoHeight"
                            modules={[ClientSideRowModelModule]}
                            paginationPageSize={pageSize}
                            rowHeight={48}
                            headerHeight={56}
                        />

                        {/* Pagination moved inside the table div */}
                        <div className="d-flex justify-content-between align-items-center mt-4 p-3 ">
                            <div>
                                Showing {filteredTasks.length > 0 ? Math.min(filteredTasks.length, (currentPage - 1) * pageSize + 1) : 0} to {Math.min(filteredTasks.length, currentPage * pageSize)} of {filteredTasks.length} entries
                            </div>
                            <Pagination>{renderPaginationItems()}</Pagination>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-5 bg-white rounded shadow-sm mx-auto mb-5" style={{ width: '85%' }}>
                        <h3 className="mb-3">No Tasks Found</h3>
                        <p className="text-muted mb-4">
                            {statusFilter !== 'all'
                                ? `No ${statusFilter} tasks available. Try changing the filter or add a new task.`
                                : 'Get started by adding your first task!'}
                        </p>
                        <button onClick={openAddTaskModal} className="btn btn-primary mt-3 py-2 px-4">
                            Add Task
                        </button>
                    </div>
                )}
            </div>

            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Task Form Modal */}
            <Modal show={showTaskModal} onHide={handleModalClose} centered size="lg">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>{editingId ? 'Edit Task' : 'Add New Task'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter name"
                                className="p-2"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                className="p-2"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Task Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="task"
                                value={formData.task}
                                onChange={handleInputChange}
                                placeholder="Enter task description"
                                className="p-2"
                                as="textarea"
                                rows={3}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="p-3">
                    <Button variant="secondary" onClick={handleModalClose} className="px-4">
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={saveTask} className="px-4">
                        {editingId ? 'Update' : 'Add'} Task
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal with Predefined Reasons */}
            <Modal show={showDeleteConfirm} onHide={() => { setShowDeleteConfirm(false); setDeleteReason(''); setIsOtherReason(false); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this task?

                    <Form.Group className="mb-3 mt-2">
                        <Form.Label htmlFor="deleteReasonSelect">Reason for Deletion</Form.Label>
                        <Form.Select
                            id="deleteReasonSelect"
                            value={deleteReason}
                            onChange={handlePredefinedReasonSelect}
                        >
                            {predefinedReasons.map((reason, index) => (
                                <option key={index} value={reason}>{reason || 'Select a reason (Optional)'}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {isOtherReason && (
                        <Form.Group className="mb-3">
                            <Form.Label htmlFor="otherReason">Please specify the reason</Form.Label>
                            <Form.Control
                                type="text"
                                id="otherReason"
                                value={deleteReason === 'Other' ? '' : deleteReason}
                                onChange={handleDeleteReasonChange}
                                placeholder="Enter your reason"
                                as="textarea"
                                rows={3}
                            />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); setIsOtherReason(false); }}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={deleteTask} disabled={!deleteReason.trim()}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}