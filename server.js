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
const User = require('./models/User');
const path = require('path');
const upload = require('./Middleware/multerConfig'); // update with the actual path to multerConfig.js
const bcrypt = require('bcrypt');
const saltRounds = 10; // Adjust salt rounds as needed

const createAdminUser = async () => {
  try {
    const user = await User.findOne({ username: 'admin' });
    if (user) {
      console.log('Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, saltRounds);

    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      userType: 'admin',
      name: 'safwan'
    });

    await adminUser.save();
    console.log('Admin user created');
  } catch (err) {
    console.error('Error creating admin user', err);
  }
};

app.use(cors());
app.use(express.json());
// Set the limit to a larger size, such as '50mb'
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For form data
// Set up multer to save uploaded files


var status="0";
  mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    status = "1";
    await createAdminUser();
    status = "2";
    
  })
app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!'+status);
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
