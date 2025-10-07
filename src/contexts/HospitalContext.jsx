import React, { createContext, useContext, useState, useEffect } from 'react'

// Tạo context cho dữ liệu bệnh viện
const HospitalContext = createContext()

// Mock data cho hệ thống
const mockData = {
  // Danh sách bác sĩ
  doctors: [
    {
      id: 1,
      name: 'BS. Trần Thị Hoa',
      email: 'doctor1@hospital.com',
      phone: '0123456789',
      specialization: 'Tim mạch',
      department: 'Khoa Tim mạch',
      license: 'BS-2023-001',
      experience: 10,
      rating: 4.8,
      avatar: null,
      status: 'active'
    },
    {
      id: 2,
      name: 'BS. Nguyễn Văn Minh',
      email: 'doctor2@hospital.com',
      phone: '0123456790',
      specialization: 'Nhi khoa',
      department: 'Khoa Nhi',
      license: 'BS-2023-002',
      experience: 8,
      rating: 4.6,
      avatar: null,
      status: 'active'
    },
    {
      id: 3,
      name: 'BS. Lê Thị Lan',
      email: 'doctor3@hospital.com',
      phone: '0123456791',
      specialization: 'Sản phụ khoa',
      department: 'Khoa Sản phụ khoa',
      license: 'BS-2023-003',
      experience: 12,
      rating: 4.9,
      avatar: null,
      status: 'active'
    }
  ],

  // Danh sách y tá
  nurses: [
    {
      id: 1,
      name: 'Điều dưỡng Lê Văn Nam',
      email: 'nurse1@hospital.com',
      phone: '0123456792',
      department: 'Khoa Cấp cứu',
      license: 'DD-2023-001',
      experience: 5,
      shift: 'Ngày',
      avatar: null,
      status: 'active'
    },
    {
      id: 2,
      name: 'Điều dưỡng Phạm Thị Hương',
      email: 'nurse2@hospital.com',
      phone: '0123456793',
      department: 'Khoa Nội',
      license: 'DD-2023-002',
      experience: 7,
      shift: 'Đêm',
      avatar: null,
      status: 'active'
    }
  ],

  // Danh sách bệnh nhân
  patients: [
    {
      id: 1,
      name: 'Nguyễn Thị Lan',
      email: 'patient1@email.com',
      phone: '0123456794',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      dateOfBirth: '1985-05-15',
      gender: 'Nữ',
      insurance: 'BHYT-2023-001',
      emergencyContact: '0123456795',
      medicalHistory: ['Cao huyết áp', 'Tiểu đường'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Trần Văn Đức',
      email: 'patient2@email.com',
      phone: '0123456796',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      dateOfBirth: '1978-12-20',
      gender: 'Nam',
      insurance: 'BHYT-2023-002',
      emergencyContact: '0123456797',
      medicalHistory: ['Viêm dạ dày'],
      status: 'active'
    }
  ],

  // Danh sách lịch hẹn
  appointments: [
    {
      id: 1,
      patientId: 1,
      doctorId: 1,
      date: '2024-01-15',
      time: '09:00',
      type: 'Khám thường',
      status: 'scheduled',
      notes: 'Khám định kỳ tim mạch'
    },
    {
      id: 2,
      patientId: 2,
      doctorId: 2,
      date: '2024-01-15',
      time: '10:30',
      type: 'Khám cấp cứu',
      status: 'completed',
      notes: 'Đau bụng dữ dội'
    }
  ],

  // Danh sách phòng
  rooms: [
    {
      id: 1,
      number: '101',
      type: 'Phòng đơn',
      floor: 1,
      department: 'Khoa Nội',
      status: 'available',
      equipment: ['Giường', 'Monitor', 'Oxy']
    },
    {
      id: 2,
      number: '102',
      type: 'Phòng đôi',
      floor: 1,
      department: 'Khoa Nội',
      status: 'occupied',
      equipment: ['Giường', 'Monitor']
    }
  ],

  // Danh sách khoa
  departments: [
    {
      id: 1,
      name: 'Khoa Tim mạch',
      description: 'Chuyên điều trị các bệnh về tim mạch',
      headDoctor: 'BS. Trần Thị Hoa',
      floor: 3,
      phone: '0123456800'
    },
    {
      id: 2,
      name: 'Khoa Nhi',
      description: 'Chuyên điều trị các bệnh ở trẻ em',
      headDoctor: 'BS. Nguyễn Văn Minh',
      floor: 2,
      phone: '0123456801'
    },
    {
      id: 3,
      name: 'Khoa Sản phụ khoa',
      description: 'Chuyên điều trị các bệnh phụ nữ và sản khoa',
      headDoctor: 'BS. Lê Thị Lan',
      floor: 4,
      phone: '0123456802'
    }
  ]
}

// Provider component
export const HospitalProvider = ({ children }) => {
  const [doctors, setDoctors] = useState(mockData.doctors)
  const [nurses, setNurses] = useState(mockData.nurses)
  const [patients, setPatients] = useState(mockData.patients)
  const [appointments, setAppointments] = useState(mockData.appointments)
  const [rooms, setRooms] = useState(mockData.rooms)
  const [departments, setDepartments] = useState(mockData.departments)
  const [loading, setLoading] = useState(false)

  // Load data từ localStorage khi component mount
  useEffect(() => {
    const savedData = localStorage.getItem('hospital_data')
    if (savedData) {
      const data = JSON.parse(savedData)
      setDoctors(data.doctors || mockData.doctors)
      setNurses(data.nurses || mockData.nurses)
      setPatients(data.patients || mockData.patients)
      setAppointments(data.appointments || mockData.appointments)
      setRooms(data.rooms || mockData.rooms)
      setDepartments(data.departments || mockData.departments)
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
