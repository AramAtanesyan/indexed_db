

let db = null;

window.onload = async function() {
    try {
        db = await initDB();
        console.log(db)
        if(!db.objectStoreNames.contains('todo_notes')) {
            console.log(22);
            const todoNotes = db.createObjectStore("todo_notes", {keyPath: "title"})
        }
    }catch (e) {
        console.log(`error was found, this is the error text : ${e}`)
    }

    const addNoteBtn = document.getElementById("addNoteBtn");
    const viewNotesBtn = document.getElementById("viewNotesBtn");
    addNoteBtn.addEventListener("click", doAddNoteOperation);
    viewNotesBtn.addEventListener("click", doViewNotesOperation);

}

async function initDB () {
    let request = indexedDB.open(document.getElementById("txtDB").value, document.getElementById("txtVersion").value);

    return new Promise((resolve, reject) => {
        request.onupgradeneeded = e => {
            console.log('upgrade called');
            resolve(e.target.result);
        }

        request.onsuccess = e => {
            console.log('success calles');
            resolve(e.target.result);
        }

        request.onerror = e => {
            console.log('error calles')
            reject(e.target.error)
        }
    })

}


async function initAddNote() {

    try {
        return db.transaction('todo_notes', "readwrite");
    }catch (e) {
        console.log(` Error! ${e.message}`)
    }
}


async function doAddNoteOperation() {
    const tx = await initAddNote();
    const pNotes = tx.objectStore('todo_notes');

    pNotes.add({
        title: prompt('note title'),
        text: prompt('note text')
    });
    doViewNotesOperation();
}


async function getTransaction() {
    return db.transaction("todo_notes","readonly");
}

async function getObjectStore(transaction) {
    return transaction.objectStore("todo_notes");
}

async function getCursor(todoNotesStore) {
    return todoNotesStore.openCursor();
}

async function doViewNotesOperation() {
    document.getElementById('todo-notes-list').innerHTML = '';

    const transaction = await getTransaction();
    const todoNotesStore = await getObjectStore(transaction);
    const todoNotesRequest = await getCursor(todoNotesStore);

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
