async function showBilling() {
    showLoading();
    
    try {
        const [billingResponse, patientsResponse, appointmentsResponse] = await Promise.all([
            apiRequest('/billing'),
            apiRequest('/patients'),
            apiRequest('/appointments?status=Completed')
        ]);
        
        const bills = billingResponse.data || [];
        window.patients = patientsResponse.data || [];
        window.completedAppointments = appointmentsResponse.data || [];
        
        document.getElementById('content-area').innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h2><i class="fas fa-file-invoice-dollar"></i> Billing</h2>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary" onclick="showAddBillModal()">
                        <i class="fas fa-plus"></i> Generate New Bill
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    ${bills.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Bill Number</th>
                                        <th>Date</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Amount</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${bills.map(bill => `
                                        <tr>
                                            <td><strong>${bill.BillNumber}</strong></td>
                                            <td>${formatDateTime(bill.BillDate)}</td>
                                            <td>
                                                ${bill.PatientName}<br>
                                                <small class="text-muted">${bill.PatientCode}</small>
                                            </td>
                                            <td>${bill.DoctorName || 'N/A'}</td>
                                            <td><strong>${formatCurrency(bill.NetAmount)}</strong></td>
                                            <td><span class="badge bg-info">${bill.PaymentMethod}</span></td>
                                            <td><span class="badge status-${bill.PaymentStatus.toLowerCase()}">${bill.PaymentStatus}</span></td>
                                            <td>
                                                <button class="btn btn-sm btn-info btn-action" onclick="viewBill(${bill.BillID})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-success btn-action" onclick="downloadBill(${bill.BillID})">
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
                            <i class="fas fa-file-invoice"></i>
                            <p>No bills generated yet</p>
                            <button class="btn btn-primary" onclick="showAddBillModal()">
                                <i class="fas fa-plus"></i> Generate First Bill
                            </button>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- Bill Modal -->
            <div class="modal fade" id="billModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Generate Bill</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="billForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Appointment (Optional)</label>
                                        <select class="form-select" id="billAppointmentId" onchange="loadAppointmentBillDetails()">
                                            <option value="">Select Appointment</option>
                                            ${window.completedAppointments.map(apt => `
                                                <option value="${apt.AppointmentID}" 
                                                        data-patient-id="${apt.PatientID}"
                                                        data-consultation-fee="${apt.ConsultationFee}">
                                                    ${apt.AppointmentCode} - ${apt.PatientName} with ${apt.DoctorName}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Patient *</label>
                                        <select class="form-select" id="billPatientId" required>
                                            <option value="">Select Patient</option>
                                            ${window.patients.map(p => `
                                                <option value="${p.PatientID}">${p.FullName} (${p.PatientCode})</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Consultation Fee (Rs.)</label>
                                        <input type="number" class="form-control" id="consultationFee" value="0" 
                                               onchange="calculateTotal()">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Lab Charges (Rs.)</label>
                                        <input type="number" class="form-control" id="labCharges" value="0" 
                                               onchange="calculateTotal()">
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Medicine Charges (Rs.)</label>
                                        <input type="number" class="form-control" id="medicineCharges" value="0" 
                                               onchange="calculateTotal()">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Other Charges (Rs.)</label>
                                        <input type="number" class="form-control" id="otherCharges" value="0" 
                                               onchange="calculateTotal()">
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Discount (Rs.)</label>
                                        <input type="number" class="form-control" id="discount" value="0" 
                                               onchange="calculateTotal()">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Payment Method *</label>
                                        <select class="form-select" id="paymentMethod" required>
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="Online">Online</option>
                                            <option value="Insurance">Insurance</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Payment Status</label>
                                        <select class="form-select" id="paymentStatus">
                                            <option value="Paid">Paid</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Notes</label>
                                        <input type="text" class="form-control" id="billNotes">
                                    </div>
                                </div>
                                
                                <div class="bill-summary">
                                    <h5>Bill Summary</h5>
                                    <table class="table table-sm">
                                        <tr>
                                            <td>Total Amount:</td>
                                            <td class="text-end"><strong id="totalAmount">Rs. 0.00</strong></td>
                                        </tr>
                                        <tr>
                                            <td>Discount:</td>
                                            <td class="text-end"><span id="discountAmount">Rs. 0.00</span></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Net Amount:</strong></td>
                                            <td class="text-end"><span class="total-amount" id="netAmount">Rs. 0.00</span></td>
                                        </tr>
                                    </table>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveBill()">Generate Bill</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading billing:', error);
    }
}

function showAddBillModal() {
    document.getElementById('billForm').reset();
    calculateTotal();
    new bootstrap.Modal(document.getElementById('billModal')).show();
}

function loadAppointmentBillDetails() {
    const select = document.getElementById('billAppointmentId');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        document.getElementById('billPatientId').value = selectedOption.dataset.patientId;
        document.getElementById('consultationFee').value = selectedOption.dataset.consultationFee || 0;
        calculateTotal();
    }
}

function calculateTotal() {
    const consultation = parseFloat(document.getElementById('consultationFee').value) || 0;
    const lab = parseFloat(document.getElementById('labCharges').value) || 0;
    const medicine = parseFloat(document.getElementById('medicineCharges').value) || 0;
    const other = parseFloat(document.getElementById('otherCharges').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    const total = consultation + lab + medicine + other;
    const net = total - discount;
    
    document.getElementById('totalAmount').textContent = formatCurrency(total);
    document.getElementById('discountAmount').textContent = formatCurrency(discount);
    document.getElementById('netAmount').textContent = formatCurrency(net);
}

async function saveBill() {
    const data = {
        appointmentId: document.getElementById('billAppointmentId').value ? 
                       parseInt(document.getElementById('billAppointmentId').value) : null,
        patientId: parseInt(document.getElementById('billPatientId').value),
        consultationFee: parseFloat(document.getElementById('consultationFee').value) || 0,
        labCharges: parseFloat(document.getElementById('labCharges').value) || 0,
        medicineCharges: parseFloat(document.getElementById('medicineCharges').value) || 0,
        otherCharges: parseFloat(document.getElementById('otherCharges').value) || 0,
        discount: parseFloat(document.getElementById('discount').value) || 0,
        paymentMethod: document.getElementById('paymentMethod').value,
        paymentStatus: document.getElementById('paymentStatus').value,
        notes: document.getElementById('billNotes').value,
        createdBy: 'Admin'
    };
    
    try {
        const response = await apiRequest('/billing', 'POST', data);
        showToast('Bill generated successfully', 'success');
        bootstrap.Modal.getInstance(document.getElementById('billModal')).hide();
        
        if (response.data && response.data.BillID) {
            downloadBill(response.data.BillID);
        }
        
        showBilling();
    } catch (error) {
        console.error('Error generating bill:', error);
    }
}

async function viewBill(id) {
    try {
        const response = await apiRequest(`/billing/${id}`);
        const bill = response.data;
        
        const details = `
Bill Number: ${bill.BillNumber}
Date: ${formatDateTime(bill.BillDate)}

Patient: ${bill.PatientName} (${bill.PatientCode})
${bill.DoctorName ? 'Doctor: ' + bill.DoctorName : ''}

Consultation Fee: ${formatCurrency(bill.ConsultationFee)}
Lab Charges: ${formatCurrency(bill.LabCharges)}
Medicine Charges: ${formatCurrency(bill.MedicineCharges)}
Other Charges: ${formatCurrency(bill.OtherCharges)}
Total: ${formatCurrency(bill.TotalAmount)}
Discount: ${formatCurrency(bill.Discount)}
Net Amount: ${formatCurrency(bill.NetAmount)}

Payment Method: ${bill.PaymentMethod}
Payment Status: ${bill.PaymentStatus}
${bill.Notes ? 'Notes: ' + bill.Notes : ''}
        `;
        
        alert(details);
    } catch (error) {
        console.error('Error loading bill:', error);
    }
}

function downloadBill(id) {
    window.open(`${API_BASE_URL}/billing/${id}/pdf`, '_blank');
}
