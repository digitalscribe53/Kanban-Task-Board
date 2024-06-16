// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
    // Store the task's due date in a variable using the Day.js library
    let dueDate = dayjs(task.dueDate);
    let today = dayjs();
    let cardClass = "";

    // If the task due date is before today's date, it is overdue, so set it to "bg-danger" (red)
    if (dueDate.isBefore(today, 'day')) {
        cardClass = "bg-danger";
    // If the task due date is within the next two days, set cardClass to "bg-warning" (yellow)
    } else if (dueDate.diff(today, 'day') <= 2) {
        cardClass = "bg-warning";
    }
    // Return a string containing the HTML for a task card.
    return `
        <div class="card task-card mb-3 ${cardClass}" data-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${dueDate.format('MMM D, YYYY')}</small></p>
                <button class="btn btn-danger delete-task">Delete</button>
            </div>
        </div>
    `;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $(".task-card").remove();
    taskList.forEach(task => {
        $(`#${task.status}-cards`).append(createTaskCard(task));
    });
    $(".task-card").draggable({
        revert: "invalid",
        opacity: 0.5,
        start: function () {
            $(this).addClass("dragging");
        },
        stop: function () {
            $(this).removeClass("dragging");
        }
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    const title = $('#task-title').val();
    const description = $('#task-description').val();
    const dueDate = $('#task-due-date').val();
    const task = {
        id: generateTaskId(),
        title: title,
        description: description,
        dueDate: dueDate,
        status: 'todo'
    };
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
    renderTaskList();
    $('#formModal').modal('hide');
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('id');
    const newStatus = $(event.target).attr('id').replace('-cards', '');
    const task = taskList.find(task => task.id === taskId);
    task.status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    $("#task-due-date").datepicker();
    
    $("#add-task-form").on("submit", handleAddTask);
    $(document).on("click", ".delete-task", handleDeleteTask);
    
    $(".lane").droppable({
        accept: ".task-card",
        drop: handleDrop
    });

    // Clear the modal input fields when the modal is shown
$('#formModal').on('show.bs.modal', function () {
    $('#add-task-form')[0].reset();
});

});
