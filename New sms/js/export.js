// js/export.js - Shared export functionality for all pages

// Show toast notification
function showToast(message, type = 'success') {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; 
            background: #1e2b4f; color: white; padding: 14px 28px;
            border-radius: 60px; box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            transform: translateY(100px); transition: transform 0.3s;
            z-index: 9999; font-weight: 500; display: flex; align-items: center; gap: 8px;
        `;
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" style="color: ${type === 'success' ? '#10b981' : '#f59e0b'}"></i> ${message}`;

    setTimeout(() => toast.style.transform = 'translateY(0)', 10);
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
    }, 2500);
}

// Export any table to CSV
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) {
        showToast('Table not found', 'error');
        return;
    }

    const rows = table.querySelectorAll('tr');
    const csv = [];

    // Process headers (th elements)
    const headers = [];
    rows[0].querySelectorAll('th').forEach(th => {
        headers.push(`"${th.innerText.trim().replace(/"/g, '""')}"`);
    });
    if (headers.length) csv.push(headers.join(','));

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length) {
            const rowData = [];
            cells.forEach(cell => {
                rowData.push(`"${cell.innerText.trim().replace(/"/g, '""')}"`);
            });
            csv.push(rowData.join(','));
        }
    }

    // Download file
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);

    showToast(`Exported ${filename}`);
}

// Generic export function for all pages
function exportTable(type) {
    switch (type) {
        case 'students':
            exportTableToCSV('studentsTable', 'students_export.csv');
            break;
        case 'fees':
            exportTableToCSV('feesTable', 'fees_export.csv');
            break;
        case 'attendance':
            exportTableToCSV('attendanceTable', 'attendance_export.csv');
            break;
        case 'teachers':
            exportTableToCSV('teachersTable', 'teachers_export.csv');
            break;
        case 'exams':
            exportTableToCSV('examsTable', 'exams_export.csv');
            break;
        default:
            showToast('Unknown table type', 'error');
    }
}

// Export all reports at once
function exportAllReports() {
    exportTable('students');
    setTimeout(() => exportTable('fees'), 500);
    setTimeout(() => exportTable('attendance'), 1000);
    setTimeout(() => exportTable('exams'), 1500);  // Add this line
    showToast('Exporting all reports...', 'info');
}

// Add table IDs to your existing pages for export to work