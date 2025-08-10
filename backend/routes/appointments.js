const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const Appointment = require('../models/Appointment'); // Assuming an Appointment model exists
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all appointments for a user (patient or doctor)
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, requireVerification, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admins can see all appointments
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to view appointments' });
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('doctor', 'firstName lastName email specialization');

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    logger.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appointments' });
  }
});

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Patient or Doctor)
router.post('/', protect, requireVerification, [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('doctor').isMongoId().withMessage('Valid doctor ID is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('reason').trim().notEmpty().withMessage('Reason for appointment is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { patient, doctor, date, time, reason } = req.body;

    // Ensure the user creating the appointment is either the patient, the doctor, or an admin
    if (req.user.role === 'patient' && req.user.id !== patient) {
      return res.status(403).json({ success: false, message: 'Not authorized to create appointment for this patient' });
    }
    if (req.user.role === 'doctor' && req.user.id !== doctor) {
      return res.status(403).json({ success: false, message: 'Not authorized to create appointment for this doctor' });
    }

    // Basic check for doctor and patient existence
    const patientExists = await User.findById(patient);
    const doctorExists = await User.findById(doctor);

    if (!patientExists || patientExists.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    if (!doctorExists || doctorExists.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const newAppointment = await Appointment.create({
      patient,
      doctor,
      date,
      time,
      reason,
      status: 'pending', // Default status
      createdBy: req.user.id
    });

    await newAppointment.populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName');

    logger.info(`New appointment created by ${req.user.email}: ${newAppointment._id}`);

    res.status(201).json({ success: true, message: 'Appointment created successfully', data: newAppointment });
  } catch (error) {
    logger.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
});

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private (Patient, Doctor, Admin)
router.put('/:id', protect, requireVerification, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only the patient, doctor, or admin can update the appointment
    if (req.user.id !== appointment.patient.toString() &&
        req.user.id !== appointment.doctor.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('patient', 'firstName lastName').populate('doctor', 'firstName lastName');

    logger.info(`Appointment ${req.params.id} updated by ${req.user.email}`);

    res.status(200).json({ success: true, message: 'Appointment updated successfully', data: updatedAppointment });
  } catch (error) {
    logger.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
});

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Patient, Doctor, Admin)
router.delete('/:id', protect, requireVerification, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only the patient, doctor, or admin can delete the appointment
    if (req.user.id !== appointment.patient.toString() &&
        req.user.id !== appointment.doctor.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this appointment' });
    }

    await appointment.remove();

    logger.info(`Appointment ${req.params.id} deleted by ${req.user.email}`);

    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    logger.error('Delete appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete appointment' });
  }
});

module.exports = router;
