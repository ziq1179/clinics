async function showDashboard() {
    showLoading();
    
    try {
        const [todayAppointments, todayBilling] = await Promise.all([
            apiRequest('/appointments/today'),
            apiRequest('/billing/today')
        ]);
        
        const appointments = todayAppointments.data || [];
        const billing = todayBilling.data || {};
        
        const scheduledCount = appointments.filter(a => a.Status === 'Scheduled').length;
        const completedCount = appointments.filter(a => a.Status === 'Completed').length;
        
        document.getElementById('content-area').innerHTML = `
            <div class="row mb-4">
                <div class="col-12">
                    <h2><i class="fas fa-chart-line"></i> Dashboard</h2>
                    <p class="text-muted">Today's Overview - ${formatDate(new Date())}</p>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-3">
                    <div class="card stat-card bg-primary text-white">
                        <div class="card-body">
                            <i class="fas fa-calendar-check float-end"></i>
                            <h3>${appointments.length}</h3>
                            <p>Total Appointments</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card stat-card bg-info text-white">
                        <div class="card-body">
                            <i class="fas fa-clock float-end"></i>
                            <h3>${scheduledCount}</h3>
                            <p>Scheduled</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card stat-card bg-success text-white">
                        <div class="card-body">
                            <i class="fas fa-check-circle float-end"></i>
                            <h3>${completedCount}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card stat-card bg-warning text-dark">
                        <div class="card-body">
                            <i class="fas fa-rupee-sign float-end"></i>
                            <h3>${formatCurrency(billing.TotalRevenue || 0)}</h3>
                            <p>Today's Revenue</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-money-bill-wave"></i> Revenue Breakdown
                        </div>
                        <div class="card-body">
                            <table class="table table-sm">
                                <tr>
                                    <td><strong>Total Bills:</strong></td>
                                    <td class="text-end">${billing.TotalBills || 0}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total Revenue:</strong></td>
                                    <td class="text-end text-success">${formatCurrency(billing.TotalRevenue || 0)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Paid Amount:</strong></td>
                                    <td class="text-end text-success">${formatCurrency(billing.PaidAmount || 0)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Pending Amount:</strong></td>
                                    <td class="text-end text-warning">${formatCurrency(billing.PendingAmount || 0)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-list-check"></i> Quick Actions
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary" onclick="showPatients()">
                                    <i class="fas fa-user-plus"></i> Register New Patient
                                </button>
                                <button class="btn btn-success" onclick="showAppointments()">
                                    <i class="fas fa-calendar-plus"></i> Book Appointment
                                </button>
                                <button class="btn btn-info" onclick="showPrescriptions()">
                                    <i class="fas fa-prescription"></i> Create Prescription
                                </button>
                                <button class="btn btn-warning" onclick="showBilling()">
                                    <i class="fas fa-file-invoice"></i> Generate Bill
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <i class="fas fa-calendar-day"></i> Today's Appointments
                        </div>
                        <div class="card-body">
                            ${appointments.length > 0 ? `
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Patient</th>
                                                <th>Doctor</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${appointments.map(apt => `
                                                <tr>
                                                    <td>${formatTime(apt.AppointmentTime)}</td>
                                                    <td>
                                                        <strong>${apt.PatientName}</strong><br>
                                                        <small class="text-muted">${apt.PatientCode}</small>
                                                    </td>
                                                    <td>
                                                        ${apt.DoctorName}<br>
                                                        <small class="text-muted">${apt.Specialization}</small>
                                                    </td>
                                                    <td><span class="badge bg-secondary">${apt.AppointmentType}</span></td>
                                                    <td><span class="badge status-${apt.Status.toLowerCase()}">${apt.Status}</span></td>
                                                    <td>
                                                        <button class="btn btn-sm btn-primary" onclick="viewAppointmentDetails(${apt.AppointmentID})">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : `
                                <div class="empty-state">
                                    <i class="fas fa-calendar-times"></i>
                                    <p>No appointments scheduled for today</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('content-area').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Failed to load dashboard data
            </div>
        `;
    }
}
