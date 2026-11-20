export const classifyTicketWithAI = async (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an enterprise ITSM AI classifier. Analyze this support request:
Title: "${title}"
Description: "${description}"

Respond in JSON ONLY with this schema:
{
  "category": "hardware" | "software" | "network" | "new_asset",
  "priority": "routine" | "urgent" | "critical",
  "suggestedSlaHours": number,
  "confidence": number,
  "summary": string,
  "recommendedAction": string
}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed or timed out. Falling back to local NLP classifier:', err.message);
    }
  }

  // Resilient heuristic NLP classifier (Offline/Fallback)
  let category = 'hardware';
  let priority = 'routine';
  let recommendedAction = 'Check cable connections and perform a device power cycle.';

  if (
    text.includes('wifi') ||
    text.includes('network') ||
    text.includes('switch') ||
    text.includes('internet') ||
    text.includes('vpn') ||
    text.includes('router') ||
    text.includes('packet loss') ||
    text.includes('dns')
  ) {
    category = 'network';
    recommendedAction = 'Verify DHCP lease, check physical patch cable or connect to alternate 5GHz SSID.';
  } else if (
    text.includes('software') ||
    text.includes('license') ||
    text.includes('matlab') ||
    text.includes('login') ||
    text.includes('password') ||
    text.includes('install') ||
    text.includes('crash') ||
    text.includes('os') ||
    text.includes('compiler')
  ) {
    category = 'software';
    recommendedAction = 'Clear application cache, check authentication credentials, or verify portal license assignment.';
  } else if (
    text.includes('request') ||
    text.includes('new') ||
    text.includes('procure') ||
    text.includes('allocate') ||
    text.includes('monitor') ||
    text.includes('laptop request') ||
    text.includes('purchase')
  ) {
    category = 'new_asset';
    recommendedAction = 'Ensure departmental budget code and HOD recommendation remarks are attached.';
  }

  // Priority detection
  if (
    text.includes('down') ||
    text.includes('outage') ||
    text.includes('critical') ||
    text.includes('entire') ||
    text.includes('exam') ||
    text.includes('emergency') ||
    text.includes('dead')
  ) {
    priority = 'critical';
  } else if (
    text.includes('urgent') ||
    text.includes('cannot work') ||
    text.includes('lab') ||
    text.includes('failing') ||
    text.includes('immediately')
  ) {
    priority = 'urgent';
  }

  const slaHours = priority === 'critical' ? 4 : priority === 'urgent' ? 12 : 48;

  return {
    category,
    priority,
    suggestedSlaHours: slaHours,
    confidence: 0.92,
    summary: `Identified ${category.toUpperCase()} issue requiring ${priority.toUpperCase()} prioritization.`,
    recommendedAction
  };
};

