async function showDoctors() {
    showLoading();
    
    try {
        const response = await apiRequest('/doctors');
        const doctors = response.data || [];
        
        document.getElementById('content-area').innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h2><i class="fas fa-user-md"></i> Doctors</h2>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" onclick="showAddDoctorModal()">
                        <i class="fas fa-plus"></i> Add New Doctor
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    ${doctors.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Doctor ID</th>
                                        <th>Name</th>
                                        <th>Specialization</th>
                                        <th>Qualification</th>
                                        <th>Contact</th>
                                        <th>Fee</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${doctors.map(doctor => `
                                        <tr>
                                            <td><strong>${doctor.doctor_code || 'N/A'}</strong></td>
                                            <td>${doctor.full_name || 'N/A'}</td>
                                            <td><span class="badge bg-info">${doctor.specialization || 'N/A'}</span></td>
                                            <td>${doctor.qualification || 'N/A'}</td>
                                            <td>${doctor.contact_number || 'N/A'}</td>
                                            <td>${formatCurrency(doctor.consultation_fee || 0)}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info btn-action" onclick="viewDoctor(${doctor.doctor_id})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-warning btn-action" onclick="editDoctor(${doctor.doctor_id})">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger btn-action" onclick="deleteDoctor(${doctor.doctor_id})">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-user-md"></i>
                            <p>No doctors registered yet</p>
                            <button class="btn btn-primary" onclick="showAddDoctorModal()">
                                <i class="fas fa-plus"></i> Add First Doctor
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Doctor Modal -->
            <div class="modal fade" id="doctorModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="doctorModalTitle">Add New Doctor</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="doctorForm">
                                <input type="hidden" id="doctorId">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Full Name *</label>
                                        <input type="text" class="form-control" id="doctorFullName" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Specialization *</label>
                                        <input type="text" class="form-control" id="specialization" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Qualification</label>
                                        <input type="text" class="form-control" id="qualification">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Contact Number *</label>
                                        <input type="text" class="form-control" id="doctorContactNumber" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Consultation Fee (Rs.)</label>
                                        <input type="number" class="form-control" id="consultationFee" value="0">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Availability Schedule</label>
                                    <textarea class="form-control" id="availabilitySchedule" rows="2" 
                                              placeholder="e.g., Mon-Sat: 9AM-5PM"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveDoctor()">Save Doctor</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

function showAddDoctorModal() {
    document.getElementById('doctorModalTitle').textContent = 'Add New Doctor';
    document.getElementById('doctorForm').reset();
    document.getElementById('doctorId').value = '';
    new bootstrap.Modal(document.getElementById('doctorModal')).show();
}

async function saveDoctor() {
    const doctorId = document.getElementById('doctorId').value;
    const data = {
        fullName: document.getElementById('doctorFullName').value,
        specialization: document.getElementById('specialization').value,
        qualification: document.getElementById('qualification').value,
        contactNumber: document.getElementById('doctorContactNumber').value,
        email: document.getElementById('email').value,
        consultationFee: parseFloat(document.getElementById('consultationFee').value) || 0,
        availabilitySchedule: document.getElementById('availabilitySchedule').value
    };
    
    try {
        if (doctorId) {
            await apiRequest(`/doctors/${doctorId}`, 'PUT', data);
            showToast('Doctor updated successfully', 'success');
        } else {
            await apiRequest('/doctors', 'POST', data);
            showToast('Doctor added successfully', 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('doctorModal')).hide();
        showDoctors();
    } catch (error) {
        console.error('Error saving doctor:', error);
    }
}

async function editDoctor(id) {
    try {
        const response = await apiRequest(`/doctors/${id}`);
        const doctor = response.data;
        
        document.getElementById('doctorModalTitle').textContent = 'Edit Doctor';
        document.getElementById('doctorId').value = doctor.doctor_id;
        document.getElementById('doctorFullName').value = doctor.full_name;
        document.getElementById('specialization').value = doctor.specialization;
        document.getElementById('qualification').value = doctor.qualification || '';
        document.getElementById('doctorContactNumber').value = doctor.contact_number;
        document.getElementById('email').value = doctor.email || '';
        document.getElementById('consultationFee').value = doctor.consultation_fee || '';
        document.getElementById('availabilitySchedule').value = doctor.availability_schedule || '';
        
        new bootstrap.Modal(document.getElementById('doctorModal')).show();
    } catch (error) {
        console.error('Error loading doctor:', error);
    }
}

async function deleteDoctor(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        try {
            await apiRequest(`/doctors/${id}`, 'DELETE');
            showToast('Doctor deleted successfully', 'success');
            showDoctors();
        } catch (error) {
            console.error('Error deleting doctor:', error);
        }
    }
}
