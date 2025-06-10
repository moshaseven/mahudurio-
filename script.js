script.js
document.addEventListener('DOMContentLoaded', () => {
    const teacherNameInput = document.getElementById('teacherName');
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const teacherRecordsList = document.getElementById('teacherRecords');

    // Pakua rekodi kutoka localStorage au unda array tupu
    let records = JSON.parse(localStorage.getItem('teacherSignInRecords')) || [];

    // Fomati tarehe na saa vizuri
    function formatDateTime(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return date.toLocaleDateString('sw-KE', options); // Kutumia Kiswahili na Kenya locale kwa mfano
    }

    // Onyesha rekodi zote
    function displayRecords() {
        teacherRecordsList.innerHTML = ''; // Futa orodha iliyopo kabla ya kuonyesha upya
        if (records.length === 0) {
            teacherRecordsList.innerHTML = '<li>Hakuna rekodi zilizohifadhiwa.</li>';
            return;
        }

        records.forEach(record => {
            const listItem = document.createElement('li');
            const signInTime = record.signIn ? `Ingia: ${formatDateTime(new Date(record.signIn))}` : '';
            const signOutTime = record.signOut ? `Toka: ${formatDateTime(new Date(record.signOut))}` : '';

            listItem.innerHTML = `
                <span>${record.name}</span>
                <span>${signInTime} ${signOutTime}</span>
            `;
            teacherRecordsList.appendChild(listItem);
        });
    }

    // Kitendo cha kusaini Ingia Kazini
    signInBtn.addEventListener('click', () => {
        const name = teacherNameInput.value.trim();
        if (name) {
            // Tafuta kama mwalimu huyu tayari ana rekodi ambayo hajatoka
            let existingRecord = records.find(r => r.name === name && !r.signOut);

            if (existingRecord) {
                alert(`${name} tayari amesaini kuingia kazini.`);
            } else {
                const newRecord = {
                    id: Date.now(), // Unique ID
                    name: name,
                    signIn: new Date().toISOString(), // Hifadhi kama ISO string
                    signOut: null
                };
                records.push(newRecord);
                localStorage.setItem('teacherSignInRecords', JSON.stringify(records));
                teacherNameInput.value = ''; // Safisha input
                displayRecords();
                alert(`${name} amesaini kuingia kazini kwa mafanikio!`);
            }
        } else {
            alert('Tafadhali ingiza jina la mwalimu.');
        }
    });

    // Kitendo cha kusaini Toka Kazini
    signOutBtn.addEventListener('click', () => {
        const name = teacherNameInput.value.trim();
        if (name) {
            // Tafuta rekodi ya mwalimu ambaye bado hajatoa saini
            let recordToUpdate = records.find(r => r.name === name && !r.signOut);

            if (recordToUpdate) {
                recordToUpdate.signOut = new Date().toISOString(); // Hifadhi kama ISO string
                localStorage.setItem('teacherSignInRecords', JSON.stringify(records));
                teacherNameInput.value = ''; // Safisha input
                displayRecords();
                alert(`${name} amesaini kutoka kazini kwa mafanikio!`);
            } else {
                alert(`${name} hajasaini kuingia kazini au tayari ametoa saini.`);
            }
        } else {
            alert('Tafadhali ingiza jina la mwalimu.');
        }
    });

    // Onyesha rekodi mara ukurasa unapofunguliwa
    displayRecords();
});