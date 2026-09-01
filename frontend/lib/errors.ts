// File ini isinya "jenis-jenis error" custom, dibikin sebagai class.
// Gunanya: kalau ada error, kita bisa tau JENIS errornya apa (401? 400? 404?)
// cukup dengan cek e instanceof ValidationError, tanpa harus baca-baca pesan errornya.

export class ValidationError extends Error {
  status = 400
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends Error {
  status = 401
  constructor(message = 'Harus login dulu.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends Error {
  status = 404
  constructor(message = 'Data tidak ditemukan.') {
    super(message)
    this.name = 'NotFoundError'
  }
}
