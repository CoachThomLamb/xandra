const express = require('express');
const router = express.Router();

// Mock data for demonstration purposes
const users = [
  { id: 1, firstName: 'John', lastName: 'Doe', foodEntries: [] },
  { id: 2, firstName: 'Jane', lastName: 'Doe', foodEntries: [] },
];

// Get user details by ID
router.get('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const user = users.find(u => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send({ message: 'User not found' });
  }
});

// Add food entries for a user
router.post('/:userId/foodEntries', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const user = users.find(u => u.id === userId);
  if (user) {
    user.foodEntries = req.body.foodEntries;
    res.status(200).send({ message: 'Food entries updated' });
  } else {
    res.status(404).send({ message: 'User not found' });
  }
});

module.exports = router;
