// js/charts.js
// shared charts for dashboard and other pages
document.addEventListener('DOMContentLoaded', function () {
    // attendance chart (dashboard)
    const attCtx = document.getElementById('attendanceChart')?.getContext('2d');
    if (attCtx) {
        new Chart(attCtx, {
            type: 'doughnut',
            data: {
                labels: ['Present 92%', 'Absent 8%'],
                datasets: [{ data: [92, 8], backgroundColor: ['#2ecc71', '#e74c3c'], borderWidth: 0 }]
            },
            options: { cutout: '70%', plugins: { legend: { position: 'bottom' } } }
        });
    }

    // exam chart (dashboard)
    const examCtx = document.getElementById('examChart')?.getContext('2d');
    if (examCtx) {
        new Chart(examCtx, {
            type: 'bar',
            data: {
                labels: ['Math', 'English', 'Biology', 'Physics', 'Chemistry'],
                datasets: [{ label: 'average marks', data: [78, 85, 66, 74, 88], backgroundColor: '#4A90E2', borderRadius: 8 }]
            },
            options: { scales: { y: { max: 100 } }, plugins: { legend: { display: false } } }
        });
    }
});