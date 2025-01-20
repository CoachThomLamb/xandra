const express = require('express');
const foodEntriesRouter = require('./api/foodEntries/route');
const usersRouter = require('./api/users/route'); // Add this line

const app = express();
const port = process.env.PORT || 5173;

app.use(express.json());
app.use('/api', foodEntriesRouter);
app.use('/api/users', usersRouter); // Add this line

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON');
    return res.status(400).send({ message: 'Invalid JSON' });
  }
  next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});