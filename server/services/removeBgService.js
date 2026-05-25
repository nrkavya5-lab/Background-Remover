import axios from 'axios';
import FormData from 'form-data';

export async function removeBackground(imageBuffer, format = 'png') {
  const removeBgKey = process.env.REMOVE_BG_API_KEY;
  const clipdropKey = process.env.CLIPDROP_API_KEY;

  if (removeBgKey && removeBgKey !== 'your_remove_bg_api_key_here') {
    try {
      return await removeBgApi(imageBuffer, format, removeBgKey);
    } catch (err) {
      console.warn('remove.bg failed, trying Clipdrop:', err.message);
    }
  }

  if (clipdropKey && clipdropKey !== 'your_clipdrop_api_key_here') {
    try {
      return await clipdropApi(imageBuffer, format, clipdropKey);
    } catch (err) {
      throw new Error('Clipdrop API error: ' + (err.response?.status === 403 ? 'Invalid API key' : err.message));
    }
  }

  throw new Error('No valid API key configured. Set CLIPDROP_API_KEY in server/.env');
}

async function removeBgApi(imageBuffer, format, apiKey) {
  const form = new FormData();
  form.append('image_file', imageBuffer, { filename: 'image.' + format });
  form.append('size', 'auto');
  form.append('format', format);

  const { data } = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
    headers: { 'X-Api-Key': apiKey, ...form.getHeaders() },
    responseType: 'arraybuffer',
    timeout: 30000,
  });
  return Buffer.from(data);
}

async function clipdropApi(imageBuffer, format, apiKey) {
  const form = new FormData();
  form.append('image_file', imageBuffer, { filename: 'image.' + format });

  const { data } = await axios.post('https://clipdrop-api.co/remove-background/v1', form, {
    headers: { 'x-api-key': apiKey, ...form.getHeaders() },
    responseType: 'arraybuffer',
    timeout: 30000,
  });
  return Buffer.from(data);
}

export async function removeBackgroundFromUrl(imageUrl, format = 'png') {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
  return removeBackground(Buffer.from(response.data), format);
}
