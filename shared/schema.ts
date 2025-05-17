import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (already existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Orders schema for IHERO 3D AI
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  originalImageUrl: text("original_image_url").notNull(),
  generatedAvatarUrl: text("generated_avatar_url").notNull(),
  prompt: text("prompt"),
  status: text("status").notNull().default("pending"),
  modelUrl: text("model_url"),
  createdAt: text("created_at").notNull().default("NOW()"),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  originalImageUrl: true,
  generatedAvatarUrl: true,
  prompt: true,
});

// Uploads schema
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  originalName: text("original_name").notNull(),
  storagePath: text("storage_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  userId: integer("user_id"),
  createdAt: text("created_at").notNull().default("NOW()"),
});

export const insertUploadSchema = createInsertSchema(uploads).pick({
  originalName: true,
  storagePath: true,
  fileType: true,
  fileSize: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;
