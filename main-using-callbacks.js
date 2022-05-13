let db = null;
const addNoteBtn = document.getElementById("addNoteBtn");
const viewNotesBtn = document.getElementById("viewNotesBtn");

initDB();
addNoteBtn.addEventListener("click", addNote);
viewNotesBtn.addEventListener("click", viewNotes);


function initDB () {
    console.log(111);
    let request = indexedDB.open(document.getElementById("txtDB").value, document.getElementById("txtVersion").value);

    request.onupgradeneeded = e => {
        db = e.target.result;

        if(!db.objectStoreNames.contains('personal_notes')) {
            const pNotes = db.createObjectStore("personal_notes", {keyPath: "title"})
        }
        if(!db.objectStoreNames.contains('todo_notes')) {
            const todoNotes = db.createObjectStore("todo_notes", {keyPath: "title"})
        }

        console.log('upgrade called');
    }

    request.onsuccess = e => {
        console.log('success calles');
        db = e.target.result;
    }

    request.onerror = e => {
        console.log('error called');
        console.log(`error: ${e.target.error} was found `)
    }


}


function viewNotes() {

    const todoTx = db.transaction("todo_notes","readonly");
    const todoNotes = todoTx.objectStore("todo_notes");
    const todoNotesRequest = todoNotes.openCursor();

    document.getElementById('todo-notes-list').innerHTML = '';

    todoNotesRequest.onsuccess = e => {
        const cursor = e.target.result

        if (cursor) {
            let note = document.createElement('li');
            note.innerHTML = `Title: ${cursor.key} Text: ${cursor.value.text} `;
            document.getElementById('todo-notes-list').appendChild(note);

            cursor.continue()
        }
    }

}

function addNote() {

    const note = {
        title: prompt('note title'),
        text: prompt('note text')
    }

    let objectStore = prompt('where to add??');
    const tx = db.transaction(objectStore, "readwrite");
    tx.onerror = e => alert( ` Error! ${e.target.error}  `);
    const pNotes = tx.objectStore(objectStore);
    pNotes.add(note);
}

