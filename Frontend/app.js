document.addEventListener('DOMContentLoaded', () => {
    // This object holds the application's current state, like who is logged in.
    // It's initialized from localStorage to keep the user logged in across browser refreshes.
    const state = {
        token: localStorage.getItem('authToken'),
        currentUser: JSON.parse(localStorage.getItem('currentUser')),
        users: [],
        tasks: [],
    };

    const API_URL = 'http://localhost:5001/api';

    // Caching DOM elements for performance. Instead of searching the DOM every time,
    // we do it once and store the references here.
    const DOMElements = {
        authView: document.getElementById('auth-view'),
        dashboardView: document.getElementById('dashboard-view'),
        loginWrapper: document.getElementById('login-wrapper'),
        registerWrapper: document.getElementById('register-wrapper'),
        showRegisterBtn: document.getElementById('show-register'),
        showLoginBtn: document.getElementById('show-login'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        loginSpinner: document.getElementById('login-spinner'),
        loginBtnText: document.querySelector('#login-form .btn-text'),
        regSpinner: document.getElementById('reg-spinner'),
        regBtnText: document.querySelector('#register-form .btn-text'),
        userNameDisplay: document.getElementById('user-name-display'),
        userInitialDisplay: document.getElementById('user-initial'),
        logoutBtn: document.getElementById('logout-btn'),
        sidebarNav: document.querySelector('.sidebar-nav'),
        mainViews: document.querySelectorAll('.main-view'),
        taskBoard: document.getElementById('task-board'),
        userListContainer: document.getElementById('user-list-container'),
        addTaskBtn: document.getElementById('add-task-btn'),
        taskModal: document.getElementById('task-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        taskForm: document.getElementById('task-form'),
        modalTitle: document.getElementById('modal-title'),
        taskIdInput: document.getElementById('task-id'),
        taskTitleInput: document.getElementById('task-title'),
        taskDescInput: document.getElementById('task-desc'),
        taskDueDateInput: document.getElementById('task-due-date'),
        taskUserInput: document.getElementById('task-user'),
        taskStatusInput: document.getElementById('task-status'),
        taskSpinner: document.getElementById('task-spinner'),
        taskBtnText: document.querySelector('#task-form .btn-text'),
        alertToast: document.getElementById('alert-toast'),
    };

    // --- UI Rendering Functions ---

    /**
     * Main UI rendering function. It decides whether to show the login/register
     * screen or the main dashboard based on the user's login status.
     */
    const renderUI = () => {
        const isLoggedIn = state.token && state.currentUser;
        DOMElements.authView.classList.toggle('d-none', isLoggedIn);
        DOMElements.dashboardView.classList.toggle('d-none', !isLoggedIn);

        if (isLoggedIn) {
            const { name } = state.currentUser;
            DOMElements.userNameDisplay.textContent = name;
            DOMElements.userInitialDisplay.textContent = name.charAt(0).toUpperCase();
            renderTasks();
            renderUsers();
        }
        // Feather icons need to be re-initialized whenever the DOM changes.
        feather.replace();
    };
    
    /**
     * Renders the task cards on the dashboard.
     */
    const renderTasks = () => {
        const board = DOMElements.taskBoard;
        board.innerHTML = '';
        if (state.tasks.length === 0) {
            board.innerHTML = '<p class="empty-board-message">No tasks found. Click "Add Task" to get started!</p>';
            return;
        }
        state.tasks.forEach(task => {
            const dueDate = new Date(task.dueDate).toLocaleDateString('en-CA');
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <div class="task-card-header">
                    <h3>${task.title}</h3>
                    <div class="task-actions">
                        <button class="btn-icon edit-task-btn" data-id="${task._id}"><i data-feather="edit-2"></i></button>
                        <button class="btn-icon delete-task-btn" data-id="${task._id}"><i data-feather="trash-2"></i></button>
                    </div>
                </div>
                <div class="task-card-body"><p>${task.description}</p></div>
                <div class="task-card-footer">
                    <span class="task-status ${task.status}">${task.status}</span>
                    <span>Due: ${dueDate}</span>
                </div>
            `;
            board.appendChild(card);
        });
        feather.replace();
    };

    /**
     * Renders the list of users in the "Users" view.
     */
    const renderUsers = () => {
        const container = DOMElements.userListContainer;
        container.innerHTML = `
            <table class="user-table">
                <thead><tr><th>Name</th><th>Email</th><th>Registered On</th></tr></thead>
                <tbody>
                    ${state.users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    };

    /**
     * Shows a toast notification at the bottom-right of the screen.
     * @param {string} message The message to display.
     * @param {string} type 'success' or 'error'.
     */
    const showToast = (message, type = 'error') => {
        const toast = DOMElements.alertToast;
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    /**
     * Opens the modal for adding or editing a task.
     * If a task object is passed, it populates the form for editing.
     * @param {object | null} task The task object to edit, or null for a new task.
     */
    const openModal = (task = null) => {
        DOMElements.taskForm.reset();
        DOMElements.taskIdInput.value = '';
        DOMElements.taskUserInput.innerHTML = state.users.map(user => `<option value="${user._id}">${user.name}</option>`).join('');
        
        if (task) {
            DOMElements.modalTitle.textContent = 'Edit Task';
            DOMElements.taskIdInput.value = task._id;
            DOMElements.taskTitleInput.value = task.title;
            DOMElements.taskDescInput.value = task.description;
            DOMElements.taskDueDateInput.value = new Date(task.dueDate).toISOString().split('T')[0];
            DOMElements.taskUserInput.value = task.assignedUser;
            DOMElements.taskStatusInput.value = task.status;
        } else {
            DOMElements.modalTitle.textContent = 'Add New Task';
        }
        DOMElements.taskModal.classList.remove('d-none');
    };

    const closeModal = () => DOMElements.taskModal.classList.add('d-none');

    // --- API Functions ---

    /**
     * A generic function for making API calls. It handles authentication headers
     * and JSON parsing automatically.
     */
    const apiCall = async (endpoint, method = 'GET', body = null, requiresAuth = true) => {
        const options = { method, headers: {} };
        if (requiresAuth) {
            options.headers['Authorization'] = `Bearer ${state.token}`;
        }
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'An API error occurred.');
        return data;
    };

    /**
     * The backend's GET /tasks route only returns a summary. This function
     * fetches the summary and then fetches the full details for each task individually.
     */
    const fetchFullTaskDetails = async () => {
        try {
            const taskSummaries = await apiCall('/tasks');
            const taskPromises = taskSummaries.map(summary => apiCall(`/tasks/${summary._id}`));
            state.tasks = await Promise.all(taskPromises);
        } catch (error) {
            showToast('Could not load tasks.');
        }
    };

    /**
     * Handles both login and registration API calls.
     */
    const handleAuth = async (endpoint, body, spinner, btnText) => {
        toggleSpinner(spinner, btnText, true);
        try {
            const data = await apiCall(endpoint, 'POST', body, false);
            state.token = data.token;
            state.currentUser = data.user;
            localStorage.setItem('authToken', state.token);
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
            showToast('Success!', 'success');
            await initApp(); // Re-initialize the app with the new logged-in state
        } catch (error) {
            showToast(error.message);
        } finally {
            toggleSpinner(spinner, btnText, false);
        }
    };
    
    /**
     * Saves a task (either creating a new one or updating an existing one).
     */
    const saveTask = async (taskData) => {
        const { taskSpinner, taskBtnText, taskIdInput } = DOMElements;
        toggleSpinner(taskSpinner, taskBtnText, true);
        const isEditing = taskIdInput.value;
        const endpoint = isEditing ? `/tasks/${isEditing}` : '/tasks';
        const method = isEditing ? 'PUT' : 'POST';
        try {
            await apiCall(endpoint, method, taskData);
            showToast(`Task ${isEditing ? 'updated' : 'created'}!`, 'success');
            await fetchFullTaskDetails();
            renderTasks();
            closeModal();
        } catch (error) {
            showToast(error.message);
        } finally {
            toggleSpinner(taskSpinner, taskBtnText, false);
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await apiCall(`/tasks/${taskId}`, 'DELETE');
            showToast('Task deleted.', 'success');
            await fetchFullTaskDetails();
            renderTasks();
        } catch (error) {
            showToast(error.message);
        }
    };

    const logout = () => {
        state.token = null;
        state.currentUser = null;
        localStorage.clear();
        renderUI();
    };

    const toggleSpinner = (spinner, text, show) => {
        spinner.classList.toggle('d-none', !show);
        text.style.display = show ? 'none' : 'inline';
    };

    // --- Event Listeners ---

    const handleNavClick = (e) => {
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;
        
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');

        DOMElements.mainViews.forEach(view => view.classList.add('d-none'));
        document.getElementById(`${navItem.dataset.view}-view`).classList.remove('d-none');
    };

    DOMElements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { loginSpinner, loginBtnText } = DOMElements;
        const body = {
            email: DOMElements.loginForm.querySelector('#login-email').value,
            password: DOMElements.loginForm.querySelector('#login-password').value
        };
        handleAuth('/users/login', body, loginSpinner, loginBtnText);
    });

    DOMElements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { regSpinner, regBtnText } = DOMElements;
        const body = {
            name: DOMElements.registerForm.querySelector('#reg-name').value,
            email: DOMElements.registerForm.querySelector('#reg-email').value,
            password: DOMElements.registerForm.querySelector('#reg-password').value
        };
        handleAuth('/users/register', body, regSpinner, regBtnText);
    });

    DOMElements.showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        DOMElements.loginWrapper.classList.add('d-none');
        DOMElements.registerWrapper.classList.remove('d-none');
    });

    DOMElements.showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        DOMElements.registerWrapper.classList.add('d-none');
        DOMElements.loginWrapper.classList.remove('d-none');
    });

    DOMElements.logoutBtn.addEventListener('click', logout);
    DOMElements.addTaskBtn.addEventListener('click', () => openModal());
    DOMElements.closeModalBtn.addEventListener('click', closeModal);
    DOMElements.sidebarNav.addEventListener('click', handleNavClick);

    DOMElements.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask({
            title: DOMElements.taskTitleInput.value,
            description: DOMElements.taskDescInput.value,
            dueDate: DOMElements.taskDueDateInput.value,
            assignedUser: DOMElements.taskUserInput.value,
            status: DOMElements.taskStatusInput.value,
        });
    });

    DOMElements.taskBoard.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-task-btn');
        if (editBtn) openModal(state.tasks.find(t => t._id === editBtn.dataset.id));
        
        const deleteBtn = e.target.closest('.delete-task-btn');
        if (deleteBtn) deleteTask(deleteBtn.dataset.id);
    });

    /**
     * This is the main function that starts the application.
     * It checks if the user is logged in and fetches the necessary data.
     */
    const initApp = async () => {
        if (state.token && state.currentUser) {
            try {
                // Fetch all data needed for the dashboard
                state.users = await apiCall('/users');
                await fetchFullTaskDetails();
            } catch (error) {
                showToast('Session expired. Please log in again.');
                logout();
            }
        }
        // Render the UI based on the final state
        renderUI();
    };

    // Start the application
    initApp();
});
