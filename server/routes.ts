import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertUploadSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { analyzePhoto, generateImage, downloadGeneratedImage } from "./services/openai";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and GIF files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
      // Save upload information to database
      const uploadData = {
        originalName: req.file.originalname,
        storagePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        userId: null // No user authentication yet
      };
      
      const uploadRecord = await storage.createUpload(uploadData);
      
      // Return the file information
      res.json({ 
        id: uploadRecord.id,
        filePath: `/uploads/${path.basename(req.file.path)}`,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      console.error('Error saving upload to database:', error);
      res.status(500).json({ error: 'Failed to process upload' });
    }
  });
  
  // Handle avatar generation API using OpenAI
  app.post('/api/generate-avatar', async (req, res) => {
    try {
      const { imageId, customPrompt } = req.body;
      
      if (!imageId) {
        return res.status(400).json({ error: 'Image ID is required' });
      }
      
      // Получаем информацию о загруженном изображении
      const upload = await storage.getUpload(parseInt(imageId));
      if (!upload) {
        return res.status(404).json({ error: 'Uploaded image not found' });
      }
      
      // Путь к загруженному изображению на сервере
      const imagePath = upload.storagePath;
      
      // Получаем анализ фото для отображения пользователю, но не для использования в промпте
      console.log('Analyzing photo with OpenAI for user feedback...');
      const description = await analyzePhoto(imagePath);
      console.log('Photo analysis result:', description);
      
      // Генерируем новое изображение 3D фигурки с помощью DALL-E 3 на основе детального описания
      console.log('Generating 3D figurine with OpenAI...');
      const imageUrl = await generateImage(
        imagePath, 
        "", // Пустая строка вместо имени
        customPrompt
      );
      console.log('Generated image URL:', imageUrl);
      
      // Скачиваем сгенерированное изображение и сохраняем на сервере
      const userId = upload.userId?.toString() || 'anonymous';
      const savedImagePath = await downloadGeneratedImage(imageUrl, userId);
      const publicPath = `/uploads/generated/${path.basename(savedImagePath)}`;
      
      res.json({
        success: true,
        avatarUrl: publicPath,
        originalImage: `/uploads/${path.basename(imagePath)}`,
        prompt: customPrompt || 'Default prompt',
        analysis: description
      });
    } catch (error: any) {
      console.error('Error generating avatar:', error);
      res.status(500).json({ error: 'Failed to generate avatar', message: error?.message || 'Unknown error' });
    }
  });
  
  // Handle order submission
  app.post('/api/submit-order', async (req, res) => {
    try {
      // Validate the request body using Zod schema
      const orderData = insertOrderSchema.safeParse(req.body);
      
      if (!orderData.success) {
        return res.status(400).json({ 
          error: 'Invalid order data', 
          details: orderData.error.format() 
        });
      }
      
      // Save order to database
      const order = await storage.createOrder(orderData.data);
      
      res.json({
        success: true,
        orderId: order.id,
        message: 'Your order has been received. You will receive an email with further instructions.'
      });
    } catch (error) {
      console.error('Error saving order to database:', error);
      res.status(500).json({ error: 'Failed to process order' });
    }
  });
  
  // Get orders (for admin view)
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });
  
  // Get a specific order by ID
  app.get('/api/orders/:id', async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });
  
  // Update order status
  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Проверяем, если это запрос на сгенерированное изображение
    if (req.url.startsWith('/generated/')) {
      const genPath = path.join(uploadDir, 'generated', path.basename(req.url));
      // Проверяем существует ли файл и находится ли он в директории uploads/generated
      if (fs.existsSync(genPath) && genPath.startsWith(path.join(uploadDir, 'generated'))) {
        return res.sendFile(genPath);
      }
    }
    
    // Стандартная обработка для обычных загрузок
    const filePath = path.join(uploadDir, path.basename(req.url));
    // Проверяем существует ли файл и находится ли он в директории uploads
    if (fs.existsSync(filePath) && filePath.startsWith(uploadDir)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
