require("dotenv").config();

const user =
{
  id: process.env.API_ID,
  username: process.env.API_KEY,
  password: process.env.API_SECRET,
}

async function authenticate({ username, password }) {
  if (username == user.username && password == user.password) {
    return { id: user.id, username: user.username };
  }
}

async function basicAuth(req, res, next) {
  // check for basic auth header
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    return res.status(401).json({ message: 'Missing authorization header.' });
  }

  // verify auth credentials
  const base64Credentials = req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  const user = await authenticate({ username, password });
  if (!user) {
    return res.status(401).json({ message: 'Invalid authentication credentials: incorrect username or password.' });
  }

  // attach user to request object
  req.user = user

  next();
}

module.exports = basicAuth;
