// users hardcoded for simplicity, store in a db for production applications

async function authenticate({ username, password }) {
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

async function getAll() {
  return users.map(u => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
}

module.exports = {
  authenticate,
  getAll
};