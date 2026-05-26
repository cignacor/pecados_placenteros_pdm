// Mock global de firebaseConfig para pruebas unitarias
// Evita inicializar Firebase real durante los tests

module.exports = {
  auth: {
    currentUser: {
      uid: 'test-uid-123',
      email: 'test@pecados.com',
    },
  },
  db: {},
};
