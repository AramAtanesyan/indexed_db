let db = null;

window.onload = async function() {
    try {
        db = await initDB();
        if(!(db.objectStoreNames.contains('todo_notes'))) {
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
    let gen = generator();

    let iter = await gen.next();

    while (!iter.done) {
        iter = await gen.next(iter.value);
    }
    iter.value.onsuccess = e => {
        const cursor = e.target.result

        if (cursor) {
            let note = document.createElement('li');
            note.innerHTML = `Title: ${cursor.key} Text: ${cursor.value.text} `;
            document.getElementById('todo-notes-list').appendChild(note);

            cursor.continue()
        }
    }
}


async function* generator() {
    const transaction = yield await getTransaction();
    const objectStore = yield await getObjectStore(transaction);
    return await getCursor(objectStore);
}