import OpenAI from "openai";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Инициализация клиента OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ключ API из переменных окружения
});

// Базовый промпт для генерации 3D фигурок
const DEFAULT_PROMPT = `A 3D stylized character in the form of a single figurine on a decorative stand, made in a cartoonish but proportionally realistic style. Natural build, slightly enlarged head (not exaggerated), clean and even background, smooth textures, soft shapes. Facial features are simplified but recognizable, the expression is friendly. Relaxed posing, hands at the sides or one on the belt. The figurine stands on a simple elegant base without any text or name plaque. The overall style resembles a high-quality collectible figurine or avatar, suitable for personalized souvenirs.

IMPORTANT: 
1. Create only ONE 3D figurine (not two or more)
2. The figurine should DIRECTLY match the person in the reference photo, including their facial features, hairstyle, and general appearance
3. Do not include any text, name, or writing on the base or anywhere in the image
4. The figurine should be immediately recognizable as this specific person`;

/**
 * Анализирует фотографию и генерирует описание с помощью OpenAI API
 * @param imagePath Путь к изображению на сервере
 * @returns Описание изображения
 */
export async function analyzePhoto(imagePath: string): Promise<string> {
  try {
    // Чтение файла изображения и преобразование в base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Отправка запроса к OpenAI API с моделью gpt-4o
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Новейшая модель OpenAI, которая может анализировать изображения
      messages: [
        {
          role: "system",
          content: "Analyze the provided image and describe the person in detail for creating a 3D figurine.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this photo and describe the person's appearance:" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "No description generated";
  } catch (error: any) {
    console.error("Error analyzing photo:", error);
    throw new Error(`Failed to analyze photo: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Создает пустую маску для редактирования изображения с помощью sharp
 * @param width Ширина исходного изображения
 * @param height Высота исходного изображения
 * @returns Путь к созданной маске
 */
async function createTransparentMask(width: number, height: number): Promise<string> {
  try {
    // Создаем директорию для масок, если она не существует
    const maskDir = path.join(process.cwd(), "uploads", "masks");
    if (!fs.existsSync(maskDir)) {
      fs.mkdirSync(maskDir, { recursive: true });
    }

    // Генерируем имя файла для маски
    const timestamp = Date.now();
    const maskPath = path.join(maskDir, `mask_${timestamp}.png`);

    // Создаем прозрачный PNG с помощью sharp
    await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .png()
    .toFile(maskPath);

    return maskPath;
  } catch (error: any) {
    console.error("Error creating mask:", error);
    throw new Error(`Failed to create mask: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Конвертирует изображение в формат PNG
 * @param imagePath Путь к исходному изображению
 * @returns Путь к конвертированному PNG изображению
 */
async function convertToPng(imagePath: string): Promise<string> {
  try {
    // Создаем директорию для конвертированных изображений, если она не существует
    const convertedDir = path.join(process.cwd(), "uploads", "converted");
    if (!fs.existsSync(convertedDir)) {
      fs.mkdirSync(convertedDir, { recursive: true });
    }

    // Генерируем имя файла для конвертированного изображения
    const filename = path.basename(imagePath, path.extname(imagePath));
    const timestamp = Date.now();
    const pngPath = path.join(convertedDir, `${filename}_${timestamp}.png`);

    // Конвертируем изображение в PNG формат
    await sharp(imagePath)
      .resize({ width: 1024, height: 1024, fit: 'inside' })
      .png()
      .toFile(pngPath);

    return pngPath;
  } catch (error: any) {
    console.error("Error converting image to PNG:", error);
    throw new Error(`Failed to convert image to PNG: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Генерирует изображение 3D фигурки с использованием двухэтапного подхода:
 * 1. Анализ изображения с GPT-4o для получения детального описания
 * 2. Генерация 3D фигурки с DALL·E 3 на основе описания и промпта
 * 
 * @param imagePath Путь к исходному изображению
 * @param name Имя персонажа (будет добавлено на базу)
 * @param customPrompt Дополнительные инструкции для генерации (необязательно)
 * @returns URL сгенерированного изображения
 */
export async function generateImage(imagePath: string, name: string, customPrompt?: string): Promise<string> {
  try {
    console.log('Starting 3D figurine generation process...');
    
    // Создаем полный промпт, заменяя [name] на реальное имя
    let basePrompt = DEFAULT_PROMPT.replace('[name]', name);
    
    // Добавляем дополнительные инструкции, если они есть
    if (customPrompt && customPrompt.trim()) {
      basePrompt += `\n\nAdditional style details: ${customPrompt}`;
    }
    
    // Шаг 1: Анализируем фотографию с помощью GPT-4o для получения детального описания
    console.log('Step 1: Analyzing the photo with GPT-4o...');
    
    // Чтение файла изображения и преобразование в base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    
    // Отправка запроса к OpenAI API с моделью gpt-4o для анализа изображения
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o", // Используем новейшую мультимодальную модель
      messages: [
        {
          role: "system",
          content: `You are an expert artist who specializes in creating detailed descriptions for 3D figurines. 
          Analyze the image and create a detailed visual description of the person that can be used to generate a 3D figurine.
          Focus on facial features, hair style and color, body type, clothing, and any distinctive characteristics.
          The description will be used with DALL·E to create a 3D figurine, so be precise and detailed.`
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this person and create a detailed description for generating a 3D cartoon-style figurine:" 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 800,
    });
    
    const personDescription = analysisResponse.choices[0].message.content || "Person with undefined features";
    console.log('Person description generated:', personDescription);
    
    // Шаг 2: Генерируем 3D фигурку с помощью DALL·E 3 используя промпт и описание
    console.log('Step 2: Generating 3D figurine with DALL·E 3...');
    
    // Создаем полный промпт, объединяя базовый промпт и описание человека
    const fullPrompt = `CREATE A SINGLE 3D FIGURINE WITHOUT ANY TEXT OR NAME ON THE BASE OR ANYWHERE IN THE IMAGE.

${basePrompt}\n\nDetails of the person: ${personDescription}`;
    
    console.log('Using prompt:', fullPrompt);
    
    // Отправляем запрос к DALL·E 3 для генерации изображения
    const generationResponse = await openai.images.generate({
      model: "dall-e-3", // Используем DALL·E 3
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd", // Высокое качество
      style: "vivid", // Яркий стиль
    });
    
    console.log('Received response from DALL·E 3');
    
    // Возвращаем URL сгенерированного изображения
    if (!generationResponse.data?.[0]?.url) {
      throw new Error('No image URL returned from OpenAI');
    }
    
    return generationResponse.data[0].url;
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Скачивает изображение по URL и сохраняет его на сервере
 * @param imageUrl URL изображения
 * @param userId ID пользователя для именования файла
 * @returns Путь к сохраненному файлу
 */
export async function downloadGeneratedImage(imageUrl: string, userId: string): Promise<string> {
  try {
    // Создаем директорию для хранения сгенерированных изображений, если она не существует
    const savePath = path.join(process.cwd(), "uploads", "generated");
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    // Формируем имя файла на основе ID пользователя и времени
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}.png`;
    const filePath = path.join(savePath, filename);

    // Скачиваем изображение
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    return filePath;
  } catch (error: any) {
    console.error("Error downloading image:", error);
    throw new Error(`Failed to download image: ${error?.message || 'Unknown error'}`);
  }
}