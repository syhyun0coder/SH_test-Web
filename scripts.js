document.addEventListener('DOMContentLoaded', function() {
    console.log('안전팀 웹페이지가 로드되었습니다.');

    const form = document.getElementById('employee-form');
    const positionSelect = document.getElementById('position');
    const nameInput = document.getElementById('name');
    const photoInput = document.getElementById('photo');
    const popup = document.getElementById('popup');
    const popupImg = document.getElementById('popup-img');
    const popupClose = document.querySelector('.popup-close');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            updateEmployeeInfo();
        });

        nameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                updateEmployeeInfo();
            }
        });
    }

    function updateEmployeeInfo() {
        const position = positionSelect.value;
        const name = nameInput.value.trim();
        const photo = photoInput.files[0];

        if (name) {
            const positionElements = document.querySelectorAll('.org-chart span');
            positionElements.forEach(function(element) {
                if (element.textContent.includes(position)) {
                    if (position.includes('주간 근무자')) {
                        element.textContent = `주간 / ${name}`;
                    } else if (position.includes('야간 근무자')) {
                        element.textContent = `야간 / ${name}`;
                    } else {
                        element.textContent = `${position} / ${name}`;
                    }
                    if (photo) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            element.dataset.photo = e.target.result; // 사진 데이터 저장
                        };
                        reader.readAsDataURL(photo);
                    }
                }
            });
            nameInput.value = '';
            photoInput.value = '';
        }
    }

    document.querySelectorAll('.org-chart span').forEach(function(span) {
        span.addEventListener('click', function() {
            const [position, name] = span.textContent.split(' / ');
            positionSelect.value = position;
            nameInput.value = name;
            nameInput.focus();
        });
    });

    document.querySelectorAll('.org-chart span').forEach(function(span) {
        span.addEventListener('click', function() {
            const photo = span.dataset.photo;
            if (photo) {
                popupImg.src = photo;
                const rect = span.getBoundingClientRect();
                popup.style.top = `${rect.top}px`;
                popup.style.left = `${rect.left - 320}px`; // 팝업을 이름 박스 좌측에 위치시킴
                popup.style.display = 'block';
            }
        });
    });

    if (popupClose) {
        popupClose.addEventListener('click', function() {
            popup.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target == popup || event.target == popupImg) {
            popup.style.display = 'none';
        }
    });

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    document.getElementById('calendar-year').innerText = currentYear;
    document.getElementById('calendar-month').innerText = currentMonth;

    updateMonthTabs(currentYear, currentMonth);
    changeMonth(currentYear, currentMonth);

    document.getElementById('year-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            goToMonth();
        }
    });

    document.getElementById('month-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            goToMonth();
        }
    });

    document.getElementById('search-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchEmployee();
        }
    });

    document.getElementById('search-input').addEventListener('input', function(event) {
        if (event.target.value.trim() === '') {
            clearSearchHighlights();
        }
    });

    document.querySelectorAll('#day-calendar-table input, #night-calendar-table input').forEach(input => {
        input.addEventListener('input', saveCalendarData);
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const nextInput = getNextInput(input);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    saveCalendarData();
                }
            }
        });
    });

    document.querySelectorAll('#day-calendar-table button, #night-calendar-table button').forEach(button => {
        button.addEventListener('click', (event) => editDay(button, event));
    });
});

function getNextInput(currentInput) {
    const inputs = Array.from(document.querySelectorAll('#day-calendar-table input, #night-calendar-table input'));
    const currentIndex = inputs.indexOf(currentInput);
    return inputs[currentIndex + 1] || null;
}

function updateMonthTabs(currentYear, currentMonth) {
    const monthTabs = document.getElementById('month-tabs');
    monthTabs.innerHTML = '';

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    const months = [
        { year: prevYear, month: prevMonth, label: `${prevMonth}월` },
        { year: currentYear, month: currentMonth, label: `${currentMonth}월` },
        { year: nextYear, month: nextMonth, label: `${nextMonth}월` }
    ];

    months.forEach(({ year, month, label }) => {
        const li = document.createElement('li');
        li.style.display = 'inline';
        li.style.margin = '0 15px';
        li.innerHTML = `<a href="#" onclick="changeMonth(${year}, ${month})">${label}</a>`;
        monthTabs.appendChild(li);
    });
}

function changeMonth(year, month) {
    const monthNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    document.getElementById('calendar-year').innerText = year;
    document.getElementById('calendar-month').innerText = monthNames[month - 1];

    const dayCalendarData = JSON.parse(localStorage.getItem(`day-calendar-${year}-${month}`)) || {};
    const nightCalendarData = JSON.parse(localStorage.getItem(`night-calendar-${year}-${month}`)) || {};

    document.getElementById('day-calendar-body').innerHTML = generateDayCalendar(year, month, dayCalendarData);
    document.getElementById('night-calendar-body').innerHTML = generateNightCalendar(year, month, nightCalendarData);

    document.querySelectorAll('#day-calendar-table input, #night-calendar-table input').forEach(input => {
        input.addEventListener('input', saveCalendarData);
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const nextInput = getNextInput(input);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    saveCalendarData();
                }
            }
        });
    });

    document.querySelectorAll('#day-calendar-table button, #night-calendar-table button').forEach(button => {
        button.addEventListener('click', (event) => editDay(button, event));
    });
}

function generateDayCalendar(year, month, savedData) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let calendarHtml = '';
    let day = 1;

    for (let i = 0; i < 6; i++) {
        calendarHtml += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < new Date(year, month - 1, 1).getDay()) {
                calendarHtml += '<td></td>';
            } else if (day > daysInMonth) {
                calendarHtml += '<td></td>';
            } else {
                const dayData = savedData[day] || { text: day, color: j === 0 ? 'red' : 'black', employees: ['', '', '', '', '', ''] };
                calendarHtml += `<td>
                                    <button style="width: 100%; color: ${j === 0 ? 'red' : dayData.color}; font-size: 1.2rem;" onclick="editDay(this, event)">${dayData.text}</button>
                                    <div><input type="text" placeholder="주간 근무자" value="${dayData.employees[0]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="주간 근무자" value="${dayData.employees[1]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="주간 근무자" value="${dayData.employees[2]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="주간 근무자" value="${dayData.employees[3]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="주간 근무자" value="${dayData.employees[4]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="주간 근무자" value="${dayData.employees[5]}" style="font-size: 1.2rem;"></div>
                                 </td>`;
                day++;
            }
        }
        calendarHtml += '</tr>';
    }
    return calendarHtml;
}

function generateNightCalendar(year, month, savedData) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let calendarHtml = '';
    let day = 1;

    for (let i = 0; i < 6; i++) {
        calendarHtml += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < new Date(year, month - 1, 1).getDay()) {
                calendarHtml += '<td></td>';
            } else if (day > daysInMonth) {
                calendarHtml += '<td></td>';
            } else {
                const dayData = savedData[day] || { text: day, color: j === 0 ? 'red' : 'black', employees: ['', '', '', ''] };
                calendarHtml += `<td>
                                    <button style="width: 100%; color: ${j === 0 ? 'red' : dayData.color}; font-size: 1.2rem;" onclick="editDay(this, event)">${dayData.text}</button>
                                    <div><input type="text" placeholder="야간 근무자" value="${dayData.employees[0]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="야간 근무자" value="${dayData.employees[1]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="야간 근무자" value="${dayData.employees[2]}" style="font-size: 1.2rem;"></div>
                                    <div><input type="text" placeholder="야간 근무자" value="${dayData.employees[3]}" style="font-size: 1.2rem;"></div>
                                 </td>`;
                day++;
            }
        }
        calendarHtml += '</tr>';
    }
    return calendarHtml;
}

function editDay(button, event) {
    const existingForm = document.querySelector('.edit-form');
    if (existingForm) {
        existingForm.remove();
    }
    const day = button.textContent;
    const color = button.style.color;
    const editForm = document.createElement('div');
    editForm.className = 'edit-form';
    editForm.style.position = 'fixed';
    editForm.style.zIndex = '1000';
    editForm.style.backgroundColor = 'white';
    editForm.style.border = '1px solid #ccc';
    editForm.style.padding = '10px';
    editForm.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    editForm.style.width = '200px';
    editForm.style.height = '200px';
    editForm.style.display = 'flex';
    editForm.style.flexDirection = 'column';
    editForm.style.justifyContent = 'center';
    editForm.style.alignItems = 'center';
    editForm.innerHTML = `
        <div style="display: flex; justify-content: space-around; width: 100%; margin-bottom: 10px;">
            <label style="display: flex; align-items: center;">
                <input type="radio" name="color" value="black" ${color === 'black' ? 'checked' : ''} style="display: none;">
                <div class="color-box" style="width: 30px; height: 30px; background-color: black; border: 1px solid #ccc; margin-right: 5px;"></div>
            </label>
            <label style="display: flex; align-items: center;">
                <input type="radio" name="color" value="blue" ${color === 'blue' ? 'checked' : ''} style="display: none;">
                <div class="color-box" style="width: 30px; height: 30px; background-color: blue; border: 1px solid #ccc; margin-right: 5px;"></div>
            </label>
            <label style="display: flex; align-items: center;">
                <input type="radio" name="color" value="red" ${color === 'red' ? 'checked' : ''} style="display: none;">
                <div class="color-box" style="width: 30px; height: 30px; background-color: red; border: 1px solid #ccc; margin-right: 5px;"></div>
            </label>
        </div>
        <input type="text" value="${day}" style="width: 100%; text-align: center; margin-top: 10px;">
        <button type="button" onclick="saveEdit(this, '${day}')" style="margin-top: 10px;">저장</button>
    `;
    document.body.appendChild(editForm);
    const rect = button.getBoundingClientRect();
    const editFormHeight = editForm.offsetHeight;
    const editFormWidth = editForm.offsetWidth;
    const topPosition = Math.min(rect.top - editFormHeight, window.innerHeight - editFormHeight - 10);
    const leftPosition = Math.min(rect.left + (rect.width / 2) - (editFormWidth / 2), window.innerWidth - editFormWidth - 10);

    editForm.style.left = `${leftPosition}px`;
    editForm.style.top = `${topPosition}px`;

    const textBox = editForm.querySelector('input[type="text"]');
    textBox.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            saveEdit(button, day);
        }
    });

    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.color-box').forEach(b => b.style.boxShadow = 'none');
            box.style.boxShadow = '0 0 10px 2px rgba(0, 0, 0, 0.5)';
            box.previousElementSibling.checked = true;
        });
    });

    document.addEventListener('click', function(event) {
        if (!editForm.contains(event.target) && event.target !== button) {
            editForm.remove();
        }
    });
}

function saveEdit(button, originalDay) {
    const editForm = button.parentElement;
    const newColor = editForm.querySelector('input[name="color"]:checked').value;
    const newText = editForm.querySelector('input[type="text"]').value;
    const dayButtons = document.querySelectorAll('button');
    const year = document.getElementById('calendar-year').textContent;
    const month = document.getElementById('calendar-month').textContent;
    const dayData = JSON.parse(localStorage.getItem(`day-calendar-${year}-${month}`)) || {};
    dayButtons.forEach(dayButton => {
        if (dayButton.textContent === originalDay) {
            dayButton.style.color = newColor;
            dayButton.textContent = newText;
            const inputs = dayButton.parentElement.querySelectorAll('input');
            const employees = Array.from(inputs).map(input => input.value);
            dayData[originalDay] = {
                text: newText,
                color: newColor,
                employees: employees
            };
        }
    });
    localStorage.setItem(`day-calendar-${year}-${month}`, JSON.stringify(dayData));
    editForm.remove();
    saveCalendarData();
}

function saveCalendarData() {
    const year = document.getElementById('calendar-year').textContent;
    const month = document.getElementById('calendar-month').textContent;
    const dayData = {};
    const dayRows = document.querySelectorAll('#day-calendar-table tbody tr');
    if (dayRows.length > 0) {
        dayRows.forEach((tr, rowIndex) => {
            tr.querySelectorAll('td').forEach((td, colIndex) => {
                const button = td.querySelector('button');
                if (button) {
                    const day = button.textContent;
                    const inputs = td.querySelectorAll('input');
                    dayData[day] = {
                        text: button.textContent,
                        color: button.style.color,
                        employees: Array.from(inputs).map(input => input.value)
                    };
                }
            });
        });
    }
    localStorage.setItem(`day-calendar-${year}-${month}`, JSON.stringify(dayData));
    console.log(`Saved day-calendar-${year}-${month}:`, dayData); // 저장된 데이터 확인

    const nightData = {};
    const nightRows = document.querySelectorAll('#night-calendar-table tbody tr');
    if (nightRows.length > 0) {
        nightRows.forEach((tr, rowIndex) => {
            tr.querySelectorAll('td').forEach((td, colIndex) => {
                const button = td.querySelector('button');
                if (button) {
                    const day = button.textContent;
                    const inputs = td.querySelectorAll('input');
                    nightData[day] = {
                        text: button.textContent,
                        color: button.style.color,
                        employees: Array.from(inputs).map(input => input.value)
                    };
                }
            });
        });
    }
    localStorage.setItem(`night-calendar-${year}-${month}`, JSON.stringify(nightData));
    console.log(`Saved night-calendar-${year}-${month}:`, nightData); // 저장된 데이터 확인
}
