//Get DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const clearAllBtn = document.getElementById('clearAllBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

//TODO array (in memory)
let todos = [];

//Initialize
init();

//Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) =>{
    if(e.key === 'Enter'){
        addTodo();
    }
});

clearAllBtn.addEventListener('click', clearAllTodos);
clearCompletedBtn.addEventListener('click', clearCompletedTodos);

//Functions
function init(){
    //Load from LocalStorage if available
    const saveTodos = localStorage.getItem('todos');
    if(saveTodos){
        todos = JSON.parse(saveTodos);
        renderTodos();
    }else{
        showEmptyState();
    }
    updateState();
}

function addTodo(){
    const text = todoInput.value.trim();

    //Validation
    if(text === ''){
        alert('Please enter a todo item.');
        todoInput.focus();
        return;
    }

    //Create todo object
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    //Add to todos array
    todos.push(todo);

    //Clear input field
    todoInput.value = '';
    todoInput.focus();

    //Save and render
    saveTodos();
    renderTodos();
    updateState();
}

function renderTodos(){
    //Clear List
    todoList.innerHTML = '';

    //Check if empty
    if(todos.length === 0){
        showEmptyState();
        return;
    }

    //Render each todo
    todos.forEach(todo => {
        const todoItem = createEditableElement(todo);

        todoList.appendChild(todoItem);
    });
}

// function createTodoElement(todo){
//     //create li element
//     const li = document.createElement('li');
//     li.className = 'todo-item';
//     li.setAttribute('data-id', todo.id);

//     if(todo.completed){
//         li.classList.add('completed');
//     }

//     //create checkbox
//     const checkbox = document.createElement('input');
//     checkbox.type = 'checkbox';
//     checkbox.className = 'todo-checkbox';
//     checkbox.checked = todo.completed;
//     checkbox.addEventListener('change', () => toggleTodo(todo.id));

//     //create span for text
//     const textSpan = document.createElement('span');
//     textSpan.className = 'todo-text';
//     textSpan.textContent = todo.text;

//     //create delete button
//     const deleteBtn = document.createElement('button');
//     deleteBtn.className = 'delete-btn';
//     deleteBtn.textContent = 'Delete';
//     deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

//     //append elements to li
//     li.appendChild(checkbox);
//     li.appendChild(textSpan);
//     li.appendChild(deleteBtn);

//     return li;
// }

function toggleTodo(id){
    const todo = todos.find(t => t.id === id);
    if(todo){
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateState();
    }
}

function deleteTodo(id){
    //Confirm deletion
    if(!confirm('Are you sure you want to delete this todo?')){
        return;
    }

    //Remove from todos array
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
    updateState();
}

function clearAllTodos(){
    if(todos.length === 0){
        alert('No todos to clear.');
        return;
    }

    if(!confirm('Are you sure you want to clear all todos?')){
        return;
    }

    todos = [];
    saveTodos();
    renderTodos();
    updateState();
}

function clearCompletedTodos(){
    const completedTodos = todos.filter(t => t.completed).length;
    if(completedTodos === 0){
        alert('No completed todos to clear.');
        return;
    }

    if (!confirm(`Delete ${completedTodos} completed todos?`)) {
        return;
    }

    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
    updateState();
}

function updateState(){
    const totalTodos = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = totalTodos - completed;

    const stats = document.getElementById('stats');
    stats.textContent = `Total: ${totalTodos} | Active: ${active} | Completed: ${completed}`;
}

function showEmptyState() {
    todoList.innerHTML = `
        <div class="empty-state">
            <h3>📭 No todos yet!</h3>
            <p>Add your first todo to get started</p>
        </div>
    `;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Bonus: Export/Import functions
function exportTodos() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todos.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function importTodos(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const importedTodos = JSON.parse(e.target.result);
            todos = importedTodos;
            saveTodos();
            renderTodos();
            updateState();
            alert('Todos imported successfully!');
        } catch (error) {
            alert('Error importing todos. Invalid file format.');
        }
    };
    
    reader.readAsText(file);
}


//Advance Features

//Filter Todos
function createFilterButtons() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-buttons';
    filterContainer.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        `;

        const filters = ['All', 'Active', 'Completed'];

        filters.forEach(filter => {
            const btn = document.createElement('button');
            btn.textContent = filter;
            btn.className = 'filter-btn';
            btn.style.cssText = `
            flex: 1;
            padding: 10px;
            border: 2px solid #007BFF;
            background: white;
            color: #007BFF;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            `;

            btn.addEventListener('click', () => {
                //remove active class from all
                filterContainer.querySelectorAll('.filter-btn').forEach(b => {
                    b.style.background = 'white';
                    b.style.color = '#007BFF';
                });

                //add active class to clicked
                btn.style.background = '#007BFF';
                btn.style.color = 'white';

                //Filter todos
                filterTodos(filter.toLowerCase());
            });

            //set All as default active
            if (filter === 'All') {
                btn.style.background = '#007BFF';
                btn.style.color = 'white';
            }

            filterContainer.appendChild(btn);
        });

        //Insert before todo List
        todoList.parentNode.insertBefore(filterContainer, todoList);
}

function filterTodos(filter) {
    const allTodos = document.querySelectorAll('.todo-item');

    allTodos.forEach(todoItem => {
        const isCompleted = todoItem.classList.contains('completed');

        switch(filter) {
            case 'active':
                todoItem.style.display = isCompleted ? 'none' : 'flex';
                break;
            case 'completed':
                todoItem.style.display = isCompleted ? 'flex' : 'none';
                break;
            default: // 'all'
                todoItem.style.display = 'flex';
        }
    });
}
// Call after init
createFilterButtons();



//Edit Todos
function createEditableElement(todo){
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.setAttribute('data-id', todo.id);

    if(todo.completed){
        li.classList.add('completed');
    }

    //checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    //Text span (double-click to edit)
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;
    textSpan.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';
        input.style.cssText = `
            flex: 1;
            padding: 8px;
            font-size: 16px;
            border: 2px solid #667eea;
            border-radius: 5px;
        `;

        // Save karne ka function
        const saveEdit = () => {
            todo.text = input.value.trim() || todo.text; // khali na ho
            textSpan.textContent = todo.text;
            li.replaceChild(textSpan, input);
        };

        // Blur pe save karo
        input.addEventListener('blur', saveEdit);

        // Enter pe save karo, Escape pe cancel karo
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter'){
                saveEdit();
            }
            if (e.key === 'Escape'){
                li.replaceChild(textSpan, input); // bina save kiye wapis
            }
        });

        li.replaceChild(input, textSpan);
        input.focus();
        input.select();
    });

    //Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    //append elements to li
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    return li;
}
