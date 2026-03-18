async function showAppointments() {
    showLoading();
    
    try {
        const [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
            apiRequest('/appointments'),
            apiRequest('/patients'),
            apiRequest('/doctors')
        ]);
        
        const appointments = appointmentsResponse.data || [];
        window.patients = patientsResponse.data || [];
        window.doctors = doctorsResponse.data || [];
        
        document.getElementById('content-area').innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h2><i class="fas fa-calendar-check"></i> Appointments</h2>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" onclick="showAddAppointmentModal()">
                        <i class="fas fa-plus"></i> Book New Appointment
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    ${appointments.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Appointment ID</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${appointments.map(apt => `
                                        <tr>
                                            <td><strong>${apt.appointment_code || 'N/A'}</strong></td>
                                            <td>${apt.appointment_date ? formatDate(apt.appointment_date) : 'N/A'}</td>
                                            <td>${formatTime(apt.appointment_time)}</td>
                                            <td>
                                                ${apt.patient_name || 'N/A'}<br>
                                                <small class="text-muted">${apt.patient_code || 'N/A'}</small>
                                            </td>
                                            <td>
                                                ${apt.doctor_name || 'N/A'}<br>
                                                <small class="text-muted">${apt.specialization || 'N/A'}</small>
                                            </td>
                                            <td><span class="badge bg-secondary">${apt.appointment_type || 'N/A'}</span></td>
                                            <td><span class="badge status-${(apt.status || '').toLowerCase()}">${apt.status || 'N/A'}</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-info btn-action" onclick="viewAppointmentDetails(${apt.appointment_id})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                ${apt.status === 'Scheduled' ? `
                                                    <button class="btn btn-sm btn-success btn-action" onclick="markCompleted(${apt.appointment_id})">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-danger btn-action" onclick="cancelAppointment(${apt.appointment_id})">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                ` : ''}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <p>No appointments booked yet</p>
                            <button class="btn btn-primary" onclick="showAddAppointmentModal()">
                                <i class="fas fa-plus"></i> Book First Appointment
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Appointment Modal -->
            <div class="modal fade" id="appointmentModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Book New Appointment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="appointmentForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Patient *</label>
                                        <select class="form-select" id="appointmentPatientId" required>
                                            <option value="">Select Patient</option>
                                            ${window.patients.map(p => `
                                                <option value="${p.patient_id}">${p.full_name} (${p.patient_code || p.patient_id})</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Doctor *</label>
                                        <select class="form-select" id="appointmentDoctorId" required>
                                            <option value="">Select Doctor</option>
                                            ${window.doctors.map(d => `
                                                <option value="${d.doctor_id}">${d.full_name} - ${d.specialization}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Date *</label>
                                        <input type="date" class="form-control" id="appointmentDate" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Time *</label>
                                        <input type="time" class="form-control" id="appointmentTime" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Type</label>
                                        <select class="form-select" id="appointmentType">
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Reason</label>
                                        <input type="text" class="form-control" id="appointmentReason">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Notes</label>
                                    <textarea class="form-control" id="appointmentNotes" rows="2"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveAppointment()">Book Appointment</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').setAttribute('min', today);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

function showAddAppointmentModal() {
    document.getElementById('appointmentForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').value = today;
    new bootstrap.Modal(document.getElementById('appointmentModal')).show();
}

async function saveAppointment() {
    const data = {
        patientId: parseInt(document.getElementById('appointmentPatientId').value),
        doctorId: parseInt(document.getElementById('appointmentDoctorId').value),
        appointmentDate: document.getElementById('appointmentDate').value,
        appointmentTime: document.getElementById('appointmentTime').value,
        appointmentType: document.getElementById('appointmentType').value,
        reason: document.getElementById('appointmentReason').value,
        notes: document.getElementById('appointmentNotes').value
    };
    
    try {
        await apiRequest('/appointments', 'POST', data);
        showToast('Appointment booked successfully', 'success');
        bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
        showAppointments();
    } catch (error) {
        console.error('Error booking appointment:', error);
    }
}

async function markCompleted(id) {
    try {
        await apiRequest(`/appointments/${id}/status`, 'PATCH', { status: 'Completed' });
        showToast('Appointment marked as completed', 'success');
        showAppointments();
    } catch (error) {
        console.error('Error updating appointment:', error);
    }
}

async function cancelAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        try {
            await apiRequest(`/appointments/${id}/status`, 'PATCH', { status: 'Cancelled' });
            showToast('Appointment cancelled', 'warning');
            showAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
        }
    }
}

async function viewAppointmentDetails(id) {
    try {
        const response = await apiRequest(`/appointments/${id}`);
        const apt = response.data;
        
        alert(`Appointment Details:\n\nID: ${apt.appointment_code}\nPatient: ${apt.patient_name}\nDoctor: ${apt.doctor_name}\nDate: ${apt.appointment_date ? formatDate(apt.appointment_date) : 'N/A'}\nTime: ${formatTime(apt.appointment_time)}\nStatus: ${apt.status}`);
    } catch (error) {
        console.error('Error loading appointment:', error);
    }
}
