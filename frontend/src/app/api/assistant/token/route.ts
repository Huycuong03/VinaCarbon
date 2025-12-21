import type { NextApiRequest, NextApiResponse } from 'next';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch(
    'https://directline.botframework.com/v3/directline/tokens/generate',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AZURE_BOT_SECRET}`,
      },
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
