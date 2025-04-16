document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const categorySelect = document.getElementById('category-select');
    const addButton = document.getElementById('add-btn');
    const tasksList = document.getElementById('tasks-list');
    const emptyState = document.querySelector('.empty-state');
    const taskCounter = document.getElementById('task-counter');
    const completedCount = document.getElementById('completed-count');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const resetButton = document.getElementById('reset-btn');
    const modal = document.getElementById('task-modal');

    let tasks = []; // Array to store tasks
    let currentFilter = 'all';

    // Function to add a new task
    function addTask(taskText, category = 'other', dueDate = '', dueTime = '') {
        const newTask = {
            id: Date.now(), // Unique ID based on timestamp
            text: taskText,
            category: category,
            completed: false,
            dueDate: dueDate,  // Store due date
            dueTime: dueTime   // Store due time
        };

        tasks.push(newTask); // Add the new task to the array
        updateTaskCounter(); // Update the task counters
        renderTasks(); // Re-render the task list
        
        // Save tasks to localStorage
        saveTasksToLocalStorage();
    }

    // Function to render the tasks list
    function renderTasks() {
        tasksList.innerHTML = ''; // Clear the task list

        if (tasks.length === 0) {
            emptyState.style.display = 'block'; // Show empty state if no tasks
        } else {
            emptyState.style.display = 'none'; // Hide empty state if tasks exist

            const filteredTasks = tasks.filter(task => 
                currentFilter === 'all' || task.category === currentFilter
            );

            filteredTasks.forEach((task) => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskItem.dataset.id = task.id; // Store the task ID in a data attribute

                // Create task text element
                const taskText = document.createElement('span');
                taskText.textContent = task.text;
                taskText.className = 'task-text';

                // Create category label
                const categoryLabel = document.createElement('span');
                categoryLabel.className = `task-category ${task.category}`;
                categoryLabel.textContent = task.category;

                // Append elements to task item
                taskItem.appendChild(taskText);
                taskItem.appendChild(categoryLabel);

                // Add click event to open the task details modal
                taskItem.addEventListener('click', function() {
                    openModal(task);
                });

                tasksList.appendChild(taskItem);
            });
        }
    }

    // Function to open the task details modal
    function openModal(task) {
        const modalTaskInput = document.getElementById('modal-task-input');
        const modalCategorySelect = document.getElementById('modal-category-select');
        const modalDueDate = document.getElementById('modal-due-date');
        const modalDueTime = document.getElementById('modal-due-time');
        const uploadTimestamp = document.getElementById('upload-timestamp');
        const saveBtn = document.getElementById('save-btn');
        const completeBtn = document.getElementById('complete-btn');
        const deleteBtn = document.getElementById('delete-btn');
        const closeBtn = document.querySelector('.close-btn');

        // Pre-fill the input fields with the current task details
        modalTaskInput.value = task.text;
        modalCategorySelect.value = task.category;
        modalDueDate.value = task.dueDate || '';
        modalDueTime.value = task.dueTime || '';

        // Generate and display the upload date and time
        const uploadDate = new Date(task.id);
        uploadTimestamp.textContent = uploadDate.toLocaleString();

        // Show the modal
        modal.style.display = 'block';

        // Save changes to the task
        saveBtn.onclick = function() {
            const updatedText = modalTaskInput.value.trim();
            const updatedCategory = modalCategorySelect.value;
            const updatedDueDate = modalDueDate.value;
            const updatedDueTime = modalDueTime.value;

            if (updatedText) {
                task.text = updatedText;
                task.category = updatedCategory;
                task.dueDate = updatedDueDate;
                task.dueTime = updatedDueTime;
                saveTasksToLocalStorage();
                renderTasks();
                modal.style.display = 'none';
            }
        };

        // Mark the task as completed
        completeBtn.onclick = function() {
            task.completed = !task.completed; // Toggle completion status
            saveTasksToLocalStorage();
            updateTaskCounter();
            renderTasks();
            modal.style.display = 'none';
        };

        // Delete the task
        deleteBtn.onclick = function() {
            tasks = tasks.filter((t) => t.id !== task.id);
            saveTasksToLocalStorage();
            updateTaskCounter();
            renderTasks();
            modal.style.display = 'none';
        };

        // Close the modal when the close button is clicked
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };

        // Close the modal when clicking outside the modal content
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Function to update the task counter
    function updateTaskCounter() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.completed).length;
        const remainingTasks = totalTasks - completedTasks;

        taskCounter.textContent = `${remainingTasks} ${remainingTasks === 1 ? 'task' : 'tasks'}`;
        completedCount.textContent = `${completedTasks} ${completedTasks === 1 ? 'completed' : 'completed'}`;
    }

    // Save tasks to localStorage
    function saveTasksToLocalStorage() {
        localStorage.setItem('mindfulTasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasksFromLocalStorage() {
        const storedTasks = localStorage.getItem('mindfulTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            updateTaskCounter();
            renderTasks();
        }
    }

    // Initialize Sortable.js for the tasks list
    new Sortable(tasksList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function (evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;

            if (oldIndex !== newIndex) {
                const movedTask = tasks.splice(oldIndex, 1)[0];
                tasks.splice(newIndex, 0, movedTask);
                saveTasksToLocalStorage();
            }
        },
    });

    // Add event listeners
    taskInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const taskText = taskInput.value.trim();
            const category = categorySelect.value;

            if (taskText) {
                addTask(taskText, category);
                taskInput.value = ''; // Clear the input field
            } else {
                alert('Task text cannot be empty!');
            }
        }
    });

    addButton.addEventListener('click', function () {
        const taskText = taskInput.value.trim();
        const category = categorySelect.value;
        const dueDate = document.getElementById('due-date')?.value || '';
        const dueTime = document.getElementById('due-time')?.value || '';

        if (taskText) {
            addTask(taskText, category, dueDate, dueTime);
            taskInput.value = ''; // Clear input field
        } else {
            alert('Task text cannot be empty!');
        }
    });

    categoryButtons.forEach((button) => {
        button.addEventListener('click', function () {
            categoryButtons.forEach((btn) => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            renderTasks();
        });
    });

    resetButton.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to reset all tasks?')) {
            tasks = [];
            saveTasksToLocalStorage();
            updateTaskCounter();
            renderTasks();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // Load tasks from localStorage on page load
    loadTasksFromLocalStorage();
});

// Star animation code
document.addEventListener('DOMContentLoaded', function () {
    const starsContainer = document.getElementById('stars-container');
    const maxStars = 50; // Maximum number of stars
    const starLifetime = 1000; // Lifetime of each star in milliseconds

    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');

        // Randomize position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;

        // Randomize animation duration and delay
        const duration = Math.random() * 1 + 0.5; // Between 0.5s and 1.5s
        const delay = Math.random() * 2; // Between 0s and 2s

        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        starsContainer.appendChild(star);

        // Remove the star after its lifetime
        setTimeout(() => {
            if (star.parentNode === starsContainer) {
                starsContainer.removeChild(star);
            }
        }, 2000);
    }

    function generateStars() {
        for (let i = 0; i < maxStars; i++) {
            setTimeout(createStar, Math.random() * starLifetime); // Stagger creation
        }
    }

    // Continuously generate stars
    setInterval(generateStars, starLifetime);
    generateStars(); // Initial generation
});