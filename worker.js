export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    let data;
    try {
      data = await request.json();
    } catch (err) {
      return new Response('Bad JSON', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { name, email, subject, message, reason, courseName } = data;

    // Build Discord payload
    const fields = [
      { name: 'Name', value: name || '(no name)', inline: true },
      { name: 'Email', value: email || '(no email)', inline: true },
      { name: 'Reason', value: reason || '(no reason)', inline: false }
    ];

    // Add Course Name field conditionally
    if (reason === 'course-related' && courseName) {
      fields.push({
        name: 'Course Name',
        value: courseName,
        inline: false
      });
    }

    const payload = {
      content: '📩 **New Support Ticket**',
      embeds: [{
        title: subject || '(no subject)',
        description: message || '(no message)',
        fields,
        timestamp: new Date().toISOString()
      }]
    };

    try {
      await fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (err) {
      return new Response('Upstream error', {
        status: 502,
        headers: corsHeaders,
      });
    }
  }
};