const express = require('express');
const cors = require('cors');
require('dotenv').config();

const leaveRoutes = require('./routes/leave');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/leave-requests', leaveRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});