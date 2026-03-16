// Dummy Data for Charts

// Attendance Donut Chart
const ctxAttendance = document.getElementById('attendanceChart').getContext('2d');
new Chart(ctxAttendance, {
    type: 'doughnut',
    data: {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [92, 8], // 92% present, 8% absent
            backgroundColor: ['#2ECC71', '#E74C3C']
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
    }
});

// Exam Performance Line Chart
const ctxExam = document.getElementById('examChart').getContext('2d');
new Chart(ctxExam, {
    type: 'line',
    data: {
        labels: ['Math', 'English', 'Biology', 'Physics', 'Chemistry'],
        datasets: [{
            label: 'Average Marks',
            data: [78, 85, 66, 74, 88],
            borderColor: '#4A90E2',
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true
    }
});