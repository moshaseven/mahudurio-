document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('signInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const teacherNameInput = document.getElementById('teacherName');
    const teacherIdInput = document.getElementById('teacherId');
    const statusMessage = document.getElementById('status-message');
    const logList = document.getElementById('logList');

    const signInStartTime = 7; // Saa 1 asubuhi
    const signInEndTime = 8;   // Saa 2 asubuhi
    const signOutStartTime = 15; // Saa 9 alasiri (3 PM)
    const signOutEndTime = 16;   // Saa 10 jioni (4 PM)

    // Funguo za kuhifadhi data kwenye localStorage
    const ATTENDANCE_KEY = 'teacherAttendanceLog';
    const LAST_SIGN_IN_DATE_KEY_PREFIX = 'lastSignInDate_';
    const LAST_SIGN_OUT_DATE_KEY_PREFIX = 'lastSignOutDate_';

    // Pakia historia ya mahudhurio kutoka localStorage
    let attendanceLog = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    renderAttendanceLog();

    function showMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `message ${type}`;
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'message';
        }, 5000); // Ficha ujumbe baada ya sekunde 5
    }

    function isSignInTimeOpen(currentTime) {
        const currentHour = currentTime.getHours();
        return currentHour >= signInStartTime && currentHour < signInEndTime;
    }

    function isSignOutTimeOpen(currentTime) {
        const currentHour = currentTime.getHours();
        return currentHour >= signOutStartTime && currentHour < signOutEndTime;
    }

    function hasAlreadySignedInToday(teacherId, currentDate) {
        const lastSignInDate = localStorage.getItem(LAST_SIGN_IN_DATE_KEY_PREFIX + teacherId);
        if (!lastSignInDate) return false;

        const lastSignInDay = new Date(lastSignInDate);
        return lastSignInDay.toDateString() === currentDate.toDateString();
    }

    function hasAlreadySignedOutToday(teacherId, currentDate) {
        const lastSignOutDate = localStorage.getItem(LAST_SIGN_OUT_DATE_KEY_PREFIX + teacherId);
        if (!lastSignOutDate) return false;

        const lastSignOutDay = new Date(lastSignOutDate);
        return lastSignOutDay.toDateString() === currentDate.toDateString();
    }

    function getFormattedDateTime(date) {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Tumia mfumo wa saa 24
        };
        return date.toLocaleString('sw-KE', options); // Tumia Kiswahili cha Kenya kwa mfumo wa tarehe/saa
    }

    signInBtn.addEventListener('click', () => {
        const teacherName = teacherNameInput.value.trim();
        const teacherId = teacherIdInput.value.trim();

        if (!teacherName || !teacherId) {
            showMessage('Tafadhali jaza jina na namba ya kitambulisho.', 'error');
            return;
        }

        const now = new Date();

        if (!isSignInTimeOpen(now)) {
            showMessage(`Muda wa kusaini ndani umefungwa. Saa za kusaini ni kuanzia ${signInStartTime} asubuhi hadi ${signInEndTime} asubuhi.`, 'error');
            return;
        }

        if (hasAlreadySignedInToday(teacherId, now)) {
            showMessage('Tayari umesaini ndani kwa leo.', 'error');
            return;
        }

        const existingEntryIndex = attendanceLog.findIndex(
            entry => entry.teacherId === teacherId && new Date(entry.date).toDateString() === now.toDateString()
        );

        if (existingEntryIndex !== -1) {
            // Ikiwa tayari kuna entry ya leo, isasisha tu
            attendanceLog[existingEntryIndex].signInTime = getFormattedDateTime(now);
            attendanceLog[existingEntryIndex].status = 'Amesaini Ndani';
            showMessage(`Mwalimu ${teacherName} amesaini ndani saa ${now.toLocaleTimeString()}.`, 'success');
        } else {
            // Unda entry mpya
            const newEntry = {
                teacherName: teacherName,
                teacherId: teacherId,
                date: getFormattedDateTime(now),
                signInTime: getFormattedDateTime(now),
                signOutTime: null,
                status: 'Amesaini Ndani'
            };
            attendanceLog.unshift(newEntry); // Weka juu ya orodha
            showMessage(`Mwalimu ${teacherName} amesaini ndani saa ${now.toLocaleTimeString()}.`, 'success');
        }

        localStorage.setItem(LAST_SIGN_IN_DATE_KEY_PREFIX + teacherId, now.toISOString()); // Hifadhi tarehe ya mwisho kusaini ndani
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceLog));
        renderAttendanceLog();
        teacherNameInput.value = '';
        teacherIdInput.value = '';
    });

    signOutBtn.addEventListener('click', () => {
        const teacherName = teacherNameInput.value.trim();
        const teacherId = teacherIdInput.value.trim();

        if (!teacherName || !teacherId) {
            showMessage('Tafadhali jaza jina na namba ya kitambulisho.', 'error');
            return;
        }

        const now = new Date();

        if (!isSignOutTimeOpen(now)) {
            showMessage(`Muda wa kusaini nje umefungwa. Saa za kusaini ni kuanzia ${signOutStartTime} alasiri hadi ${signOutEndTime} jioni.`, 'error');
            return;
        }

        if (hasAlreadySignedOutToday(teacherId, now)) {
            showMessage('Tayari umesaini nje kwa leo.', 'error');
            return;
        }

        const entryToUpdateIndex = attendanceLog.findIndex(
            entry => entry.teacherId === teacherId && new Date(entry.date).toDateString() === now.toDateString()
        );

        if (entryToUpdateIndex === -1) {
            showMessage('Hukuweza kusaini nje kwa sababu hujasaini ndani bado kwa leo.', 'error');
            return;
        }

        attendanceLog[entryToUpdateIndex].signOutTime = getFormattedDateTime(now);
        attendanceLog[entryToUpdateIndex].status = 'Amesaini Nje';
        showMessage(`Mwalimu ${teacherName} amesaini nje saa ${now.toLocaleTimeString()}.`, 'success');

        localStorage.setItem(LAST_SIGN_OUT_DATE_KEY_PREFIX + teacherId, now.toISOString()); // Hifadhi tarehe ya mwisho kusaini nje
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceLog));
        renderAttendanceLog();
        teacherNameInput.value = '';
        teacherIdInput.value = '';
    });

    function renderAttendanceLog() {
        logList.innerHTML = '';
        attendanceLog.forEach(entry => {
            const listItem = document.createElement('li');
            const dateStr = new Date(entry.date).toLocaleDateString('sw-KE'); // Onyesha tarehe tu
            listItem.innerHTML = `
                <div>
                    <strong>${entry.teacherName}</strong> (${entry.teacherId})<br>
                    <span>Tarehe: ${dateStr}</span><br>
                    <span>Kuingia: ${entry.signInTime ? new Date(entry.signInTime).toLocaleTimeString('sw-KE') : 'Bado'}</span><br>
                    <span>Kutoka: ${entry.signOutTime ? new Date(entry.signOutTime).toLocaleTimeString('sw-KE') : 'Bado'}</span>
                </div>
                <span>Status: ${entry.status}</span>
            `;
            logList.appendChild(listItem);
        });
    }

    // Sasisha hali ya vifungo kulingana na muda wa sasa
    function updateButtonStatus() {
        const now = new Date();
        const signInOpen = isSignInTimeOpen(now);
        const signOutOpen = isSignOutTimeOpen(now);

        // Kwenye mfumo halisi wa uzalishaji, unaweza pia kuzingatia kama mwalimu fulani amesaini ndani/nje tayari
        // Hapa tunaangalia tu kama dirisha la muda limefunguliwa.
        signInBtn.disabled = !signInOpen;
        signOutBtn.disabled = !signOutOpen;

        if (!signInOpen && now.getHours() < signInStartTime) {
             showMessage(`Muda wa kusaini ndani utafunguka saa ${signInStartTime} asubuhi.`, 'info');
        } else if (!signInOpen && now.getHours() >= signInEndTime) {
             showMessage(`Muda wa kusaini ndani umefungwa.`, 'info');
        }

        if (!signOutOpen && now.getHours() < signOutStartTime) {
             showMessage(`Muda wa kusaini nje utafunguka saa ${signOutStartTime} alasiri.`, 'info');
        } else if (!signOutOpen && now.getHours() >= signOutEndTime) {
             showMessage(`Muda wa kusaini nje umefungwa.`, 'info');
        }
    }

    // Piga simu mara moja na kisha kila sekunde 30 kusasisha hali
    updateButtonStatus();
    setInterval(updateButtonStatus, 30000); // Sasisha kila sekunde 30
});