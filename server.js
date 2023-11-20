const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const expertRoutes = require('./routes/ExpertRoutes'); // Make sure this path is correct
const reportRoutes = require('./routes/ReportRoutes'); // Make sure this path is correct
const propertyRoutes = require('./routes/PropertyRoutes'); // Make sure this path is correct
const equipmentRoutes = require('./routes/EquipmentRoutes'); // Make sure this path is correct
const customerRoutes = require('./routes/CustomerRoutes'); // Make sure this path is correct
const app = express();
const userRoutes = require('./routes/UserRoutes'); // Make sure this path is correct
const expertRequestRoutes = require('./routes/ExpertRequestsRoutes'); // Make sure this path is correct

const path = require('path');
const upload = require('./Middleware/multerConfig'); // update with the actual path to multerConfig.js

app.use(cors());
app.use(express.json());
// Set the limit to a larger size, such as '50mb'
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For form data
// Set up multer to save uploaded files




mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Check if the admin user already exists
    User.findOne({ username: 'admin' }, (err, user) => {
      if (err) {
        console.error('Error checking for admin user', err);
        return;
      }

      if (user) {
        console.log('Admin user already exists');
      } else {
        // Create a new user instance if not exist
        const adminUser = new User({
          username: 'admin',
          password: 'safwan123' // Remember to hash the password in a real-world application
        });

        adminUser.save()
          .then(() => console.log('Admin user created'))
          .catch(err => console.error('Error creating admin user', err));
      }
    });
  })
app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!');
});

app.use('/uploads', express.static('uploads'));

app.use('/api/expertrequests', expertRequestRoutes);
// Use the equipment routes
app.use('/api/experts', expertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/property', propertyRoutes);
// If you have other models, their routes would be used in a similar manner
// For example:
app.use('/api/customers', customerRoutes);
// app.use('/reports', reportRoutes);
app.use('/api/users', userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
