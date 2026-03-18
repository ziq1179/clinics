async function showPatients() {
    showLoading();
    
    try {
        const response = await apiRequest('/patients');
        const patients = response.data || [];
        
        document.getElementById('content-area').innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h2><i class="fas fa-user-injured"></i> Patients</h2>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" onclick="showAddPatientModal()">
                        <i class="fas fa-plus"></i> Add New Patient
                    </button>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <input type="text" class="form-control search-box" id="patientSearch" 
                           placeholder="Search by name, CNIC, or contact..." 
                           onkeyup="searchPatients()">
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    ${patients.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-hover" id="patientsTable">
                                <thead>
                                    <tr>
                                        <th>Patient ID</th>
                                        <th>Name</th>
                                        <th>CNIC</th>
                                        <th>Contact</th>
                                        <th>Gender</th>
                                        <th>Age</th>
                                        <th>Registered</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${patients.map(patient => `
                                        <tr>
                                            <td><strong>${patient.PatientCode}</strong></td>
                                            <td>${patient.FullName}</td>
                                            <td>${patient.CNIC || 'N/A'}</td>
                                            <td>${patient.ContactNumber}</td>
                                            <td>${patient.Gender}</td>
                                            <td>${patient.Age || 'N/A'}</td>
                                            <td>${formatDate(patient.CreatedDate)}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info btn-action" onclick="viewPatient(${patient.PatientID})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-warning btn-action" onclick="editPatient(${patient.PatientID})">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger btn-action" onclick="deletePatient(${patient.PatientID})">
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
                            <i class="fas fa-user-injured"></i>
                            <p>No patients registered yet</p>
                            <button class="btn btn-primary" onclick="showAddPatientModal()">
                                <i class="fas fa-plus"></i> Add First Patient
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Patient Modal -->
            <div class="modal fade" id="patientModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="patientModalTitle">Add New Patient</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="patientForm">
                                <input type="hidden" id="patientId">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Full Name *</label>
                                        <input type="text" class="form-control" id="fullName" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">CNIC</label>
                                        <input type="text" class="form-control" id="cnic" placeholder="42101-1234567-1">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Contact Number *</label>
                                        <input type="text" class="form-control" id="contactNumber" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Gender *</label>
                                        <select class="form-select" id="gender" required>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Date of Birth</label>
                                        <input type="date" class="form-control" id="dateOfBirth">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Address</label>
                                        <input type="text" class="form-control" id="address">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Medical History</label>
                                    <textarea class="form-control" id="medicalHistory" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="savePatient()">Save Patient</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading patients:', error);
    }
}

function showAddPatientModal() {
    document.getElementById('patientModalTitle').textContent = 'Add New Patient';
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
    new bootstrap.Modal(document.getElementById('patientModal')).show();
}

async function savePatient() {
    const patientId = document.getElementById('patientId').value;
    const data = {
        fullName: document.getElementById('fullName').value,
        cnic: document.getElementById('cnic').value,
        contactNumber: document.getElementById('contactNumber').value,
        gender: document.getElementById('gender').value,
        dateOfBirth: document.getElementById('dateOfBirth').value || null,
        address: document.getElementById('address').value,
        medicalHistory: document.getElementById('medicalHistory').value
    };
    
    try {
        if (patientId) {
            await apiRequest(`/patients/${patientId}`, 'PUT', data);
            showToast('Patient updated successfully', 'success');
        } else {
            await apiRequest('/patients', 'POST', data);
            showToast('Patient registered successfully', 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('patientModal')).hide();
        showPatients();
    } catch (error) {
        console.error('Error saving patient:', error);
    }
}

async function editPatient(id) {
    try {
        const response = await apiRequest(`/patients/${id}`);
        const patient = response.data;
        
        document.getElementById('patientModalTitle').textContent = 'Edit Patient';
        document.getElementById('patientId').value = patient.PatientID;
        document.getElementById('fullName').value = patient.FullName;
        document.getElementById('cnic').value = patient.CNIC || '';
        document.getElementById('contactNumber').value = patient.ContactNumber;
        document.getElementById('gender').value = patient.Gender;
        document.getElementById('dateOfBirth').value = patient.DateOfBirth ? patient.DateOfBirth.split('T')[0] : '';
        document.getElementById('address').value = patient.Address || '';
        document.getElementById('medicalHistory').value = patient.MedicalHistory || '';
        
        new bootstrap.Modal(document.getElementById('patientModal')).show();
    } catch (error) {
        console.error('Error loading patient:', error);
    }
}

async function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            await apiRequest(`/patients/${id}`, 'DELETE');
            showToast('Patient deleted successfully', 'success');
            showPatients();
        } catch (error) {
            console.error('Error deleting patient:', error);
        }
    }
}

function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
    const table = document.getElementById('patientsTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    }
}
