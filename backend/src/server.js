const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use(errorHandler);

app.listen(config.port, () => console.log(`Backend listening on port ${config.port}`));
