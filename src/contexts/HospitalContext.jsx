import React, { createContext, useContext, useState, useEffect } from 'react'

// Tạo context cho dữ liệu bệnh viện
const HospitalContext = createContext()

// Provider component
export const HospitalProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([])
  const [nurses, setNurses] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [rooms, setRooms] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)

  // Load data từ localStorage khi component mount (chỉ dùng nếu đã từng lưu),
  // không fallback sang mockData nữa
  useEffect(() => {
    const savedData = localStorage.getItem('hospital_data')
    if (savedData) {
      const data = JSON.parse(savedData)
      setDoctors(data.doctors || [])
      setNurses(data.nurses || [])
      setPatients(data.patients || [])
      setAppointments(data.appointments || [])
      setRooms(data.rooms || [])
      setDepartments(data.departments || [])
    }
  }, [])

  // Lưu data vào localStorage khi có thay đổi
  const saveToLocalStorage = (newData) => {
    localStorage.setItem('hospital_data', JSON.stringify(newData))
  }

  // CRUD operations cho Doctors
  const addDoctor = (doctor) => {
    const newDoctor = {
      ...doctor,
      id: Date.now(),
      status: 'active'
    }
    const newDoctors = [...doctors, newDoctor]
    setDoctors(newDoctors)
    saveToLocalStorage({
      doctors: newDoctors,
      nurses,
      patients,
      appointments,
      rooms,
      departments
    })
    return newDoctor
  }

  const updateDoctor = (id, updates) => {
    const newDoctors = doctors.map(doctor =>
      doctor.id === id ? { ...doctor, ...updates } : doctor
    )
    setDoctors(newDoctors)
    saveToLocalStorage({
      doctors: newDoctors,
      nurses,
      patients,
      appointments,
      rooms,
      departments
    })
  }

  const deleteDoctor = (id) => {
    const newDoctors = doctors.filter(doctor => doctor.id !== id)
    setDoctors(newDoctors)
    saveToLocalStorage({
      doctors: newDoctors,
      nurses,
      patients,
      appointments,
      rooms,
      departments
    })
  }

  // CRUD operations cho Nurses
  const addNurse = (nurse) => {
    const newNurse = {
      ...nurse,
      id: Date.now(),
      status: 'active'
    }
    const newNurses = [...nurses, newNurse]
    setNurses(newNurses)
    saveToLocalStorage({
      doctors,
      nurses: newNurses,
      patients,
      appointments,
      rooms,
      departments
    })
    return newNurse
  }

  const updateNurse = (id, updates) => {
    const newNurses = nurses.map(nurse =>
      nurse.id === id ? { ...nurse, ...updates } : nurse
    )
    setNurses(newNurses)
    saveToLocalStorage({
      doctors,
      nurses: newNurses,
      patients,
      appointments,
      rooms,
      departments
    })
  }

  const deleteNurse = (id) => {
    const newNurses = nurses.filter(nurse => nurse.id !== id)
    setNurses(newNurses)
    saveToLocalStorage({
      doctors,
      nurses: newNurses,
      patients,
      appointments,
      rooms,
      departments
    })
  }

  // CRUD operations cho Patients
  const addPatient = (patient) => {
    const newPatient = {
      ...patient,
      id: Date.now(),
      status: 'active'
    }
    const newPatients = [...patients, newPatient]
    setPatients(newPatients)
    saveToLocalStorage({
      doctors,
      nurses,
      patients: newPatients,
      appointments,
      rooms,
      departments
    })
    return newPatient
  }

  const updatePatient = (id, updates) => {
    const newPatients = patients.map(patient =>
      patient.id === id ? { ...patient, ...updates } : patient
    )
    setPatients(newPatients)
    saveToLocalStorage({
      doctors,
      nurses,
      patients: newPatients,
      appointments,
      rooms,
      departments
    })
  }

  const deletePatient = (id) => {
    const newPatients = patients.filter(patient => patient.id !== id)
    setPatients(newPatients)
    saveToLocalStorage({
      doctors,
      nurses,
      patients: newPatients,
      appointments,
      rooms,
      departments
    })
  }

  // CRUD operations cho Appointments
  const addAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now(),
      status: 'scheduled'
    }
    const newAppointments = [...appointments, newAppointment]
    setAppointments(newAppointments)
    saveToLocalStorage({
      doctors,
      nurses,
      patients,
      appointments: newAppointments,
      rooms,
      departments
    })
    return newAppointment
  }

  const updateAppointment = (id, updates) => {
    const newAppointments = appointments.map(appointment =>
      appointment.id === id ? { ...appointment, ...updates } : appointment
    )
    setAppointments(newAppointments)
    saveToLocalStorage({
      doctors,
      nurses,
      patients,
      appointments: newAppointments,
      rooms,
      departments
    })
  }

  const deleteAppointment = (id) => {
    const newAppointments = appointments.filter(appointment => appointment.id !== id)
    setAppointments(newAppointments)
    saveToLocalStorage({
      doctors,
      nurses,
      patients,
      appointments: newAppointments,
      rooms,
      departments
    })
  }

  const value = {
    // Data
    doctors,
    nurses,
    patients,
    appointments,
    rooms,
    departments,
    loading,

    // Doctor operations
    addDoctor,
    updateDoctor,
    deleteDoctor,

    // Nurse operations
    addNurse,
    updateNurse,
    deleteNurse,

    // Patient operations
    addPatient,
    updatePatient,
    deletePatient,

    // Appointment operations
    addAppointment,
    updateAppointment,
    deleteAppointment
  }

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  )
}

// Hook để sử dụng HospitalContext
export const useHospital = () => {
  const context = useContext(HospitalContext)
  if (!context) {
    throw new Error('useHospital phải được sử dụng trong HospitalProvider')
  }
  return context
}

export default HospitalContext
