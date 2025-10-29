const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function executeCode(code: string) {
  const response = await fetch(`${API_URL}/coordinator/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if  (!response.ok) {
    throw new Error('Failed to execute code');
  }
  return response.json();
}
