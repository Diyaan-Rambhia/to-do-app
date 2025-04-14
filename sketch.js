document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const categorySelect = document.getElementById('category-select');
    const addButton = document.getElementById('add-btn');
    const tasksList = document.getElementById('tasks-list');
    const emptyState = document.querySelector('.empty-state');
    const taskCounter = document.getElementById('task-counter');
    const categoryButtons = document.querySelectorAll('.category-btn');

    let tasks = [];
    let currentFilter = 'all';

    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            category: categorySelect.value,
            completed: false,
        };

        tasks.push(newTask);
        taskInput.value = '';
        renderTasks();
        updateTaskCounter();
    }

    function renderTasks() {
        tasksList.innerHTML = ''; // Clear the task list

        const filteredTasks = currentFilter === 'all'
            ? tasks
            : tasks.filter((task) => task.category === currentFilter);

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'flex'; // Show empty state
        } else {
            emptyState.style.display = 'none'; // Hide empty state
            filteredTasks.forEach((task) => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';

                // Create three-dot menu button
                const menuButton = document.createElement('div');
                menuButton.className = 'menu-button';
                menuButton.textContent = '⋮';
                menuButton.style.cursor = 'pointer';

                // Create dropdown menu
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'dropdown-menu';
                dropdownMenu.innerHTML = `
                    <button class="menu-option complete-option">Completed</button>
                    <button class="menu-option delete-option">Delete</button>
                `;
                dropdownMenu.style.display = 'none'; // Hidden by default

                // Show/hide dropdown menu on click
                menuButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    dropdownMenu.style.display =
                        dropdownMenu.style.display === 'none' ? 'block' : 'none';
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', () => {
                    dropdownMenu.style.display = 'none';
                });

                // Mark task as completed
                dropdownMenu.querySelector('.complete-option').addEventListener('click', () => {
                    task.completed = true;
                    updateTaskCounter();
                    renderTasks();
                });

                // Delete task
                dropdownMenu.querySelector('.delete-option').addEventListener('click', () => {
                    tasks = tasks.filter((t) => t.id !== task.id);
                    updateTaskCounter();
                    renderTasks();
                });

                // Create task text element
                const taskText = document.createElement('span');
                taskText.textContent = task.text;
                taskText.className = 'task-text';
                taskText.style.cursor = 'pointer'; // Make it look clickable

                // Add click event to open task in a modal
                taskText.addEventListener('click', () => {
                    openModal(task.text);
                });

                // Create category label
                const categoryLabel = document.createElement('span');
                categoryLabel.className = 'task-category';
                categoryLabel.textContent = task.category;

                // Append elements to task item
                taskItem.appendChild(menuButton);
                taskItem.appendChild(dropdownMenu);
                taskItem.appendChild(taskText);
                taskItem.appendChild(categoryLabel);

                // Add completed class if the task is completed
                if (task.completed) {
                    taskItem.classList.add('completed');
                }

                tasksList.appendChild(taskItem);
            });
        }
    }

    // Function to open the modal
    function openModal(taskText) {
        const modal = document.getElementById('task-modal');
        const modalTaskText = document.getElementById('modal-task-text');
        const closeBtn = document.querySelector('.close-btn');

        // Set the task text in the modal
        modalTaskText.textContent = taskText;

        // Show the modal
        modal.style.display = 'block';

        // Close the modal when the close button is clicked
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close the modal when clicking outside the modal content
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    function updateTaskCounter() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.completed).length;
        const remainingTasks = totalTasks - completedTasks;

        taskCounter.textContent = `${remainingTasks} ${remainingTasks === 1 ? 'task' : 'tasks'}`;
        const completedCount = document.getElementById('completed-count');
        completedCount.textContent = `${completedTasks} ${completedTasks === 1 ? 'completed' : 'completed'}`;
    }

    
    // Initialize Sortable.js for the tasks list
    new Sortable(tasksList, {
        animation: 150, // Smooth animation when dragging
        ghostClass: 'sortable-ghost', // Class for the ghost element
        chosenClass: 'sortable-chosen', // Class for the chosen element
        onEnd: function (evt) {
            // Rearrange the tasks array based on the new order
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;

            if (oldIndex !== newIndex) {
                const movedTask = tasks.splice(oldIndex, 1)[0];
                tasks.splice(newIndex, 0, movedTask);
            }
        },
    });

    taskInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addTask();
        }
    });

    addButton.addEventListener('click', addTask);

    categoryButtons.forEach((button) => {
        button.addEventListener('click', function () {
            categoryButtons.forEach((btn) => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            renderTasks();
        });
    });

    // Reset All button functionality
    const resetButton = document.getElementById('reset-btn');
    resetButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        tasks = []; // Clear all tasks
        updateTaskCounter(); // Update the counters
        renderTasks(); // Re-render the task list
    });
});