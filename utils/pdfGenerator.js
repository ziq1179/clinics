const PDFDocument = require('pdfkit');
const moment = require('moment');

function generatePrescriptionPDF(prescription) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            
            doc.fontSize(20).text('MEDICAL PRESCRIPTION', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Prescription No: ${prescription.PrescriptionCode}`, { align: 'right' });
            doc.text(`Date: ${moment(prescription.CreatedDate).format('DD-MMM-YYYY')}`, { align: 'right' });
            doc.moveDown();
            
            doc.fontSize(12).text('Doctor Information', { underline: true });
            doc.fontSize(10).text(`Name: ${prescription.DoctorName}`);
            doc.text(`Specialization: ${prescription.Specialization}`);
            doc.text(`Qualification: ${prescription.Qualification || 'N/A'}`);
            doc.moveDown();
            
            doc.fontSize(12).text('Patient Information', { underline: true });
            doc.fontSize(10).text(`Name: ${prescription.PatientName}`);
            doc.text(`Patient ID: ${prescription.PatientCode}`);
            doc.text(`Age: ${prescription.Age || 'N/A'} | Gender: ${prescription.Gender}`);
            doc.text(`Contact: ${prescription.ContactNumber}`);
            doc.moveDown();
            
            if (prescription.VitalSigns) {
                doc.fontSize(12).text('Vital Signs', { underline: true });
                doc.fontSize(10).text(prescription.VitalSigns);
                doc.moveDown();
            }
            
            if (prescription.Symptoms) {
                doc.fontSize(12).text('Symptoms', { underline: true });
                doc.fontSize(10).text(prescription.Symptoms);
                doc.moveDown();
            }
            
            if (prescription.Diagnosis) {
                doc.fontSize(12).text('Diagnosis', { underline: true });
                doc.fontSize(10).text(prescription.Diagnosis);
                doc.moveDown();
            }
            
            if (prescription.Medicines) {
                doc.fontSize(12).text('Rx - Medicines Prescribed', { underline: true });
                doc.fontSize(10).text(prescription.Medicines);
                doc.moveDown();
            }
            
            if (prescription.LabTests) {
                doc.fontSize(12).text('Lab Tests Recommended', { underline: true });
                doc.fontSize(10).text(prescription.LabTests);
                doc.moveDown();
            }
            
            if (prescription.Instructions) {
                doc.fontSize(12).text('Instructions', { underline: true });
                doc.fontSize(10).text(prescription.Instructions);
                doc.moveDown();
            }
            
            if (prescription.FollowUpDate) {
                doc.fontSize(10).text(`Follow-up Date: ${moment(prescription.FollowUpDate).format('DD-MMM-YYYY')}`, { 
                    underline: true 
                });
                doc.moveDown();
            }
            
            doc.moveDown(2);
            doc.fontSize(10).text('_____________________', { align: 'right' });
            doc.text(`Dr. ${prescription.DoctorName}`, { align: 'right' });
            doc.text(prescription.Specialization, { align: 'right' });
            
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

function generateBillPDF(bill) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            
            doc.fontSize(22).text('PAYMENT RECEIPT', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Bill No: ${bill.BillNumber}`, { align: 'right' });
            doc.text(`Date: ${moment(bill.BillDate).format('DD-MMM-YYYY hh:mm A')}`, { align: 'right' });
            doc.moveDown();
            
            doc.fontSize(12).text('Patient Information', { underline: true });
            doc.fontSize(10).text(`Name: ${bill.PatientName}`);
            doc.text(`Patient ID: ${bill.PatientCode}`);
            doc.text(`Contact: ${bill.PatientContact}`);
            doc.moveDown();
            
            if (bill.DoctorName) {
                doc.fontSize(12).text('Consultation Details', { underline: true });
                doc.fontSize(10).text(`Doctor: ${bill.DoctorName}`);
                doc.text(`Specialization: ${bill.Specialization || 'N/A'}`);
                if (bill.AppointmentCode) {
                    doc.text(`Appointment: ${bill.AppointmentCode}`);
                }
                doc.moveDown();
            }
            
            doc.fontSize(12).text('Billing Details', { underline: true });
            doc.moveDown(0.5);
            
            const lineY = doc.y;
            doc.moveTo(50, lineY).lineTo(550, lineY).stroke();
            doc.moveDown(0.5);
            
            doc.fontSize(10);
            const startY = doc.y;
            
            if (bill.ConsultationFee > 0) {
                doc.text('Consultation Fee', 60, doc.y);
                doc.text(`Rs. ${parseFloat(bill.ConsultationFee).toFixed(2)}`, 450, doc.y, { align: 'right' });
                doc.moveDown();
            }
            
            if (bill.LabCharges > 0) {
                doc.text('Lab Charges', 60, doc.y);
                doc.text(`Rs. ${parseFloat(bill.LabCharges).toFixed(2)}`, 450, doc.y, { align: 'right' });
                doc.moveDown();
            }
            
            if (bill.MedicineCharges > 0) {
                doc.text('Medicine Charges', 60, doc.y);
                doc.text(`Rs. ${parseFloat(bill.MedicineCharges).toFixed(2)}`, 450, doc.y, { align: 'right' });
                doc.moveDown();
            }
            
            if (bill.OtherCharges > 0) {
                doc.text('Other Charges', 60, doc.y);
                doc.text(`Rs. ${parseFloat(bill.OtherCharges).toFixed(2)}`, 450, doc.y, { align: 'right' });
                doc.moveDown();
            }
            
            const lineY2 = doc.y;
            doc.moveTo(50, lineY2).lineTo(550, lineY2).stroke();
            doc.moveDown(0.5);
            
            doc.fontSize(11).text('Total Amount', 60, doc.y, { bold: true });
            doc.text(`Rs. ${parseFloat(bill.TotalAmount).toFixed(2)}`, 450, doc.y, { align: 'right' });
            doc.moveDown();
            
            if (bill.Discount > 0) {
                doc.fontSize(10).text('Discount', 60, doc.y);
                doc.text(`- Rs. ${parseFloat(bill.Discount).toFixed(2)}`, 450, doc.y, { align: 'right' });
                doc.moveDown();
                
                const lineY3 = doc.y;
                doc.moveTo(50, lineY3).lineTo(550, lineY3).stroke();
                doc.moveDown(0.5);
            }
            
            doc.fontSize(14).text('Net Amount', 60, doc.y, { bold: true });
            doc.text(`Rs. ${parseFloat(bill.NetAmount).toFixed(2)}`, 450, doc.y, { align: 'right', bold: true });
            doc.moveDown();
            
            const lineY4 = doc.y;
            doc.moveTo(50, lineY4).lineTo(550, lineY4).stroke();
            doc.moveDown();
            
            doc.fontSize(10).text(`Payment Method: ${bill.PaymentMethod}`);
            doc.text(`Payment Status: ${bill.PaymentStatus}`);
            
            if (bill.Notes) {
                doc.moveDown();
                doc.text(`Notes: ${bill.Notes}`);
            }
            
            doc.moveDown(3);
            doc.fontSize(9).text('Thank you for choosing our clinic!', { align: 'center', italics: true });
            doc.text('For any queries, please contact the reception.', { align: 'center', italics: true });
            
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    generatePrescriptionPDF,
    generateBillPDF
};
