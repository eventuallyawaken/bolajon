export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_AVATAR_INPUT_BYTES = 5 * 1024 * 1024; // 5 MB
export const TARGET_AVATAR_SIZE_PX = 256;
const MAX_OUTPUT_DATA_URL_LENGTH = 450_000;

export const MAX_RECEIPT_INPUT_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_RECEIPT_DIMENSION_PX = 1280;
const MAX_RECEIPT_DATA_URL_LENGTH = 950_000;

export class AvatarValidationError extends Error {
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'PROCESS_FAILED';

  constructor(code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'PROCESS_FAILED', message: string) {
    super(message);
    this.code = code;
  }
}

export async function processAvatarFile(file: File): Promise<string> {
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
    throw new AvatarValidationError(
      'INVALID_TYPE',
      'Faqat JPG, PNG yoki WebP formatidagi rasmlarga ruxsat etiladi'
    );
  }

  if (file.size > MAX_AVATAR_INPUT_BYTES) {
    throw new AvatarValidationError(
      'FILE_TOO_LARGE',
      'Rasm hajmi 5 MB dan oshmasligi kerak'
    );
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image load error'));
      image.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = TARGET_AVATAR_SIZE_PX;
    canvas.height = TARGET_AVATAR_SIZE_PX;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new AvatarValidationError('PROCESS_FAILED', 'Rasmni qayta ishlashda xatolik');
    }

    // Markazdan 1:1 kvadrat qilib qirqish
    const minSide = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const sx = ((img.naturalWidth || img.width) - minSide) / 2;
    const sy = ((img.naturalHeight || img.height) - minSide) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      sx,
      sy,
      minSide,
      minSide,
      0,
      0,
      TARGET_AVATAR_SIZE_PX,
      TARGET_AVATAR_SIZE_PX
    );

    let dataUrl = canvas.toDataURL('image/webp', 0.82);
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    }

    if (dataUrl.length > MAX_OUTPUT_DATA_URL_LENGTH) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.65);
    }

    if (dataUrl.length > MAX_OUTPUT_DATA_URL_LENGTH) {
      throw new AvatarValidationError(
        'FILE_TOO_LARGE',
        'Rasmni yetarlicha kichiklashtirib bo‘lmadi, boshqa rasm tanlang'
      );
    }

    return dataUrl;
  } catch (err) {
    if (err instanceof AvatarValidationError) throw err;
    throw new AvatarValidationError('PROCESS_FAILED', 'Rasmni o‘qishda xatolik yuz berdi');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function processReceiptFile(file: File): Promise<string> {
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
    throw new AvatarValidationError(
      'INVALID_TYPE',
      'Faqat JPG, PNG yoki WebP formatidagi chek rasmlariga ruxsat etiladi'
    );
  }

  if (file.size > MAX_RECEIPT_INPUT_BYTES) {
    throw new AvatarValidationError(
      'FILE_TOO_LARGE',
      'Chek rasmi hajmi 8 MB dan oshmasligi kerak'
    );
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image load error'));
      image.src = objectUrl;
    });

    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;
    const scale = Math.min(1, MAX_RECEIPT_DIMENSION_PX / Math.max(origW, origH));
    const targetW = Math.max(1, Math.round(origW * scale));
    const targetH = Math.max(1, Math.round(origH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new AvatarValidationError('PROCESS_FAILED', 'Rasmni qayta ishlashda xatolik');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    let dataUrl = canvas.toDataURL('image/webp', 0.85);
    if (!dataUrl.startsWith('data:image/webp')) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    }

    if (dataUrl.length > MAX_RECEIPT_DATA_URL_LENGTH) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.72);
    }

    if (dataUrl.length > MAX_RECEIPT_DATA_URL_LENGTH) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.55);
    }

    if (dataUrl.length > MAX_RECEIPT_DATA_URL_LENGTH) {
      throw new AvatarValidationError(
        'FILE_TOO_LARGE',
        'Chek rasmini yetarlicha kichiklashtirib bo‘lmadi, boshqa rasm tanlang'
      );
    }

    return dataUrl;
  } catch (err) {
    if (err instanceof AvatarValidationError) throw err;
    throw new AvatarValidationError('PROCESS_FAILED', 'Rasmni o‘qishda xatolik yuz berdi');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
