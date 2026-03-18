async function showPrescriptions() {
    showLoading();
    
    try {
        const [prescriptionsResponse, appointmentsResponse] = await Promise.all([
            apiRequest('/prescriptions'),
            apiRequest('/appointments?status=Scheduled')
        ]);
        
        const prescriptions = prescriptionsResponse.data || [];
        window.scheduledAppointments = appointmentsResponse.data || [];
        
        document.getElementById('content-area').innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h2><i class="fas fa-prescription"></i> Prescriptions</h2>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" onclick="showAddPrescriptionModal()">
                        <i class="fas fa-plus"></i> Create New Prescription
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    ${prescriptions.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Prescription ID</th>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Diagnosis</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${prescriptions.map(rx => `
                                        <tr>
                                            <td><strong>${rx.PrescriptionCode}</strong></td>
                                            <td>${formatDate(rx.CreatedDate)}</td>
                                            <td>
                                                ${rx.PatientName}<br>
                                                <small class="text-muted">${rx.PatientCode}</small>
                                            </td>
                                            <td>
                                                ${rx.DoctorName}<br>
                                                <small class="text-muted">${rx.Specialization}</small>
                                            </td>
                                            <td>${rx.Diagnosis ? rx.Diagnosis.substring(0, 50) + '...' : 'N/A'}</td>
                                            <td>
                                                <button class="btn btn-sm btn-info btn-action" onclick="viewPrescription(${rx.PrescriptionID})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-success btn-action" onclick="downloadPrescription(${rx.PrescriptionID})">
                                                    <i class="fas fa-download"></i> PDF
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <i class="fas fa-prescription"></i>
                            <p>No prescriptions created yet</p>
                            <button class="btn btn-primary" onclick="showAddPrescriptionModal()">
                                <i class="fas fa-plus"></i> Create First Prescription
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Prescription Modal -->
            <div class="modal fade" id="prescriptionModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Create Prescription</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="prescriptionForm" class="prescription-form">
                                <div class="mb-3">
                                    <label class="form-label">Appointment *</label>
                                    <select class="form-select" id="prescriptionAppointmentId" required onchange="loadAppointmentDetails()">
                                        <option value="">Select Appointment</option>
                                        ${window.scheduledAppointments.map(apt => `
                                            <option value="${apt.AppointmentID}" 
                                                    data-patient-id="${apt.PatientID}" 
                                                    data-doctor-id="${apt.DoctorID}">
                                                ${apt.AppointmentCode} - ${apt.PatientName} with ${apt.DoctorName} (${formatDate(apt.AppointmentDate)})
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                
                                <input type="hidden" id="prescriptionPatientId">
                                <input type="hidden" id="prescriptionDoctorId">
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Vital Signs</label>
                                        <textarea class="form-control" id="vitalSigns" rows="2" 
                                                  placeholder="BP: 120/80, Temp: 98.6°F, Pulse: 72"></textarea>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Symptoms</label>
                                        <textarea class="form-control" id="symptoms" rows="2"></textarea>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Diagnosis</label>
                                    <textarea class="form-control" id="diagnosis" rows="3"></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Medicines Prescribed</label>
                                    <textarea class="form-control" id="medicines" rows="4" 
                                              placeholder="1. Medicine Name - Dosage - Duration&#10;2. Medicine Name - Dosage - Duration"></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Lab Tests Recommended</label>
                                    <textarea class="form-control" id="labTests" rows="2" 
                                              placeholder="CBC, Blood Sugar, etc."></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Instructions</label>
                                    <textarea class="form-control" id="instructions" rows="3" 
                                              placeholder="Take medicines after meals, rest, etc."></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Follow-up Date</label>
                                    <input type="date" class="form-control" id="followUpDate">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="savePrescription()">Save & Print Prescription</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading prescriptions:', error);
    }
}

function showAddPrescriptionModal() {
    document.getElementById('prescriptionForm').reset();
    new bootstrap.Modal(document.getElementById('prescriptionModal')).show();
}

function loadAppointmentDetails() {
    const select = document.getElementById('prescriptionAppointmentId');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        document.getElementById('prescriptionPatientId').value = selectedOption.dataset.patientId;
        document.getElementById('prescriptionDoctorId').value = selectedOption.dataset.doctorId;
    }
}

async function savePrescription() {
    const data = {
        appointmentId: parseInt(document.getElementById('prescriptionAppointmentId').value),
        patientId: parseInt(document.getElementById('prescriptionPatientId').value),
        doctorId: parseInt(document.getElementById('prescriptionDoctorId').value),
        vitalSigns: document.getElementById('vitalSigns').value,
        symptoms: document.getElementById('symptoms').value,
        diagnosis: document.getElementById('diagnosis').value,
        medicines: document.getElementById('medicines').value,
        labTests: document.getElementById('labTests').value,
        instructions: document.getElementById('instructions').value,
        followUpDate: document.getElementById('followUpDate').value || null
    };
    
    try {
        const response = await apiRequest('/prescriptions', 'POST', data);
        showToast('Prescription created successfully', 'success');
        bootstrap.Modal.getInstance(document.getElementById('prescriptionModal')).hide();
        
        if (response.data && response.data.PrescriptionID) {
            downloadPrescription(response.data.PrescriptionID);
        }
        
        showPrescriptions();
    } catch (error) {
        console.error('Error creating prescription:', error);
    }
}

async function viewPrescription(id) {
    try {
        const response = await apiRequest(`/prescriptions/${id}`);
        const rx = response.data;
        
        const details = `
Prescription: ${rx.PrescriptionCode}
Date: ${formatDate(rx.CreatedDate)}

Patient: ${rx.PatientName} (${rx.PatientCode})
Age: ${rx.Age} | Gender: ${rx.Gender}

Doctor: ${rx.DoctorName}
Specialization: ${rx.Specialization}

Vital Signs: ${rx.VitalSigns || 'N/A'}
Symptoms: ${rx.Symptoms || 'N/A'}
Diagnosis: ${rx.Diagnosis || 'N/A'}

Medicines:
${rx.Medicines || 'N/A'}

Lab Tests:
${rx.LabTests || 'N/A'}

Instructions:
${rx.Instructions || 'N/A'}

Follow-up: ${rx.FollowUpDate ? formatDate(rx.FollowUpDate) : 'N/A'}
        `;
        
        alert(details);
    } catch (error) {
        console.error('Error loading prescription:', error);
    }
}

function downloadPrescription(id) {
    window.open(`${API_BASE_URL}/prescriptions/${id}/pdf`, '_blank');
}
